import { createHmac, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { getN8nConfig, getN8nConfigurationState, isN8nEnabled } from "@/lib/integrations/n8n-env";

export { isN8nEnabled } from "@/lib/integrations/n8n-env";

export type N8nEventName = "lead.priority_detected" | "lead.created" | "lead.follow_up_due" | "lead.status_changed";
export type N8nLogStatus = "pending" | "success" | "failed" | "skipped";

export type PriorityLeadEventPayload = {
  event_id: string;
  event: "lead.priority_detected";
  occurred_at: string;
  idempotency_key: string;
  organization: { id: string; name: string };
  lead: {
    id: string;
    reference: string;
    full_name: string;
    email: string;
    phone: string | null;
    company: string | null;
    service_interest: string | null;
    score: number;
    priority: "cold" | "warm" | "hot" | "urgent";
    status: "new" | "contacted" | "qualified" | "won" | "lost" | "archived";
    created_at: string;
  };
  analysis: { summary: string | null; recommended_next_action: string | null };
};

type N8nEventPayload = PriorityLeadEventPayload;

const callbackSchema = z.object({
  event: z.enum(["integration.processed", "integration.failed", "notification.sent", "notification.failed", "sheets.backup.completed", "sheets.backup.failed"]),
  event_id: z.string().uuid().optional(),
  idempotency_key: z.string().min(1).max(240),
  status: z.enum(["success", "failed"]),
  message: z.string().max(500).optional(),
  occurred_at: z.string().datetime().optional(),
}).strict();

export type N8nCallback = z.infer<typeof callbackSchema>;
export { callbackSchema };

export type IntegrationResult = {
  ok: boolean;
  status: N8nLogStatus;
  logId: string | null;
  idempotencyKey: string;
  error?: string;
  duplicate?: boolean;
};

export type SafeN8nStatus = {
  enabled: boolean;
  configured: boolean;
  last_status: "not_configured" | "healthy" | "failed" | "unknown";
  last_checked_at: string | null;
  last_error: string | null;
  latest_logs: Array<{ id: string; event_name: string; status: N8nLogStatus; attempt_count: number; executed_at: string }>;
};

function sign(secret: string, timestamp: string, rawBody: string) {
  return createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

export function generateN8nSignature(timestamp: string, rawBody: string) {
  const config = getN8nConfig();
  if (!config) throw new Error("n8n_not_configured");
  return sign(config.webhookSecret, timestamp, rawBody);
}

export function verifyN8nCallbackSignature(timestamp: string, rawBody: string, signature: string) {
  const config = getN8nConfig();
  if (!config?.callbackSecret || !signature) return false;
  const expected = sign(config.callbackSecret, timestamp, rawBody);
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function makeN8nIdempotencyKey(input: { leadId: string; eventName: string; score: number; priority: string }) {
  return `lead:${input.leadId}:event:${input.eventName}:score:${input.score}:priority:${input.priority}`;
}

export function isN8nTimestampFresh(timestamp: string, nowMs = Date.now()) {
  const seconds = Number(timestamp);
  return Number.isFinite(seconds) && Math.abs(nowMs / 1000 - seconds) <= 300;
}

function safeError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return "timeout";
  if (error instanceof Error && error.message) return error.message.slice(0, 240).replaceAll(/[\r\n]/g, " ");
  return "request_failed";
}

async function updateIntegrationStatus(admin: SupabaseClient, organizationId: string, status: "not_configured" | "healthy" | "failed" | "unknown", errorMessage: string | null) {
  await admin.from("n8n_integration_status").upsert({
    organization_id: organizationId,
    n8n_enabled: isN8nEnabled(),
    n8n_last_status: status,
    n8n_last_checked_at: new Date().toISOString(),
    n8n_last_error: errorMessage,
  }, { onConflict: "organization_id" });
}

async function notifyOrganizationAdmins(admin: SupabaseClient, organizationId: string, logId: string, errorMessage: string) {
  const { data: recipients } = await admin.from("organization_members").select("user_id").eq("organization_id", organizationId).in("role", ["owner", "admin"]);
  for (const recipient of recipients || []) {
    await admin.from("internal_notifications").insert({
      organization_id: organizationId,
      recipient_user_id: recipient.user_id,
      notification_type: "n8n_failed",
      severity: "error",
      title: "La automatización n8n no respondió",
      body: `El evento externo falló: ${errorMessage}`,
      link_url: `/dashboard/settings?automationLog=${logId}`,
      dedupe_key: `n8n-failed:${logId}`,
      metadata: { automation_log_id: logId },
    });
  }
}

async function findLog(admin: SupabaseClient, organizationId: string, idempotencyKey: string) {
  return admin.from("automation_logs").select("id, status, attempt_count, request_payload, response_payload").eq("organization_id", organizationId).eq("idempotency_key", idempotencyKey).maybeSingle();
}

async function startLog(admin: SupabaseClient, input: { organizationId: string; leadId?: string | null; eventName: string; idempotencyKey: string; payload: N8nEventPayload; force?: boolean }) {
  const existing = await findLog(admin, input.organizationId, input.idempotencyKey);
  if (existing.data && !input.force) return { log: existing.data, shouldSend: false };

  if (existing.data && input.force) {
    const nextAttempt = (existing.data.attempt_count || 0) + 1;
    const { data } = await admin.from("automation_logs").update({ status: "pending", attempt_count: nextAttempt, executed_at: new Date().toISOString(), error_message: null, request_payload: input.payload }).eq("id", existing.data.id).eq("organization_id", input.organizationId).select("id, status, attempt_count").single();
    return { log: data || existing.data, shouldSend: true };
  }

  const { data, error } = await admin.from("automation_logs").insert({
    organization_id: input.organizationId,
    lead_id: input.leadId || null,
    automation_name: "n8n",
    event_name: input.eventName,
    status: "pending",
    idempotency_key: input.idempotencyKey,
    request_payload: input.payload,
    attempt_count: 1,
  }).select("id, status, attempt_count").single();
  if (!error && data) return { log: data, shouldSend: true };

  const raced = await findLog(admin, input.organizationId, input.idempotencyKey);
  return { log: raced.data, shouldSend: false };
}

export async function sendN8nEvent(input: { admin: SupabaseClient; organizationId: string; leadId?: string | null; eventName: N8nEventName; idempotencyKey: string; payload: N8nEventPayload; force?: boolean }): Promise<IntegrationResult> {
  const started = await startLog(input.admin, input);
  const logId = started.log?.id || null;
  if (!started.shouldSend) {
    const status = (started.log?.status || "skipped") as N8nLogStatus;
    return { ok: status === "success", status, logId, idempotencyKey: input.idempotencyKey, duplicate: true };
  }

  if (!isN8nEnabled()) {
    await input.admin.from("automation_logs").update({ status: "skipped", response_payload: { reason: "n8n_disabled" }, executed_at: new Date().toISOString() }).eq("id", logId);
    await updateIntegrationStatus(input.admin, input.organizationId, "not_configured", null);
    return { ok: true, status: "skipped", logId, idempotencyKey: input.idempotencyKey };
  }

  const config = getN8nConfig();
  if (!config) {
    const errorMessage = "missing_server_configuration";
    await input.admin.from("automation_logs").update({ status: "failed", error_message: errorMessage, executed_at: new Date().toISOString() }).eq("id", logId);
    await updateIntegrationStatus(input.admin, input.organizationId, "failed", errorMessage);
    if (logId) await notifyOrganizationAdmins(input.admin, input.organizationId, logId, errorMessage);
    return { ok: false, status: "failed", logId, idempotencyKey: input.idempotencyKey, error: errorMessage };
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawBody = JSON.stringify(input.payload);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-leadpilot-event": input.eventName,
        "x-leadpilot-timestamp": timestamp,
        "x-leadpilot-signature": generateN8nSignature(timestamp, rawBody),
        "x-leadpilot-idempotency-key": input.idempotencyKey,
      },
      body: rawBody,
      signal: controller.signal,
    });
    const responseText = (await response.text()).slice(0, 1_000);
    if (!response.ok) throw new Error(`http_${response.status}`);
    await input.admin.from("automation_logs").update({ status: "success", response_payload: { status: response.status, body: responseText }, error_message: null, executed_at: new Date().toISOString() }).eq("id", logId);
    await updateIntegrationStatus(input.admin, input.organizationId, "healthy", null);
    return { ok: true, status: "success", logId, idempotencyKey: input.idempotencyKey };
  } catch (error) {
    const errorMessage = safeError(error);
    await input.admin.from("automation_logs").update({ status: "failed", error_message: errorMessage, response_payload: null, executed_at: new Date().toISOString() }).eq("id", logId);
    await updateIntegrationStatus(input.admin, input.organizationId, "failed", errorMessage);
    if (logId) await notifyOrganizationAdmins(input.admin, input.organizationId, logId, errorMessage);
    return { ok: false, status: "failed", logId, idempotencyKey: input.idempotencyKey, error: errorMessage };
  } finally {
    clearTimeout(timeout);
  }
}

export async function retryN8nEvent(admin: SupabaseClient, logId: string): Promise<IntegrationResult> {
  const { data: log } = await admin.from("automation_logs").select("id, organization_id, lead_id, event_name, idempotency_key, request_payload").eq("id", logId).maybeSingle();
  if (!log || !log.idempotency_key || !log.request_payload) return { ok: false, status: "failed", logId, idempotencyKey: log?.idempotency_key || "", error: "log_not_retryable" };
  return sendN8nEvent({ admin, organizationId: log.organization_id, leadId: log.lead_id, eventName: log.event_name as N8nEventName, idempotencyKey: log.idempotency_key, payload: log.request_payload as N8nEventPayload, force: true });
}

export async function getN8nIntegrationStatus(client: SupabaseClient, organizationId: string): Promise<SafeN8nStatus> {
  const configState = getN8nConfigurationState();
  const [{ data: status }, { data: logs }] = await Promise.all([
    client.from("n8n_integration_status").select("n8n_enabled, n8n_last_status, n8n_last_checked_at, n8n_last_error").eq("organization_id", organizationId).maybeSingle(),
    client.from("automation_logs").select("id, event_name, status, attempt_count, executed_at").eq("organization_id", organizationId).eq("automation_name", "n8n").order("executed_at", { ascending: false }).limit(10),
  ]);
  return {
    enabled: configState.enabled,
    configured: configState.configured,
    last_status: status?.n8n_last_status || (configState.configured ? "unknown" : "not_configured"),
    last_checked_at: status?.n8n_last_checked_at || null,
    last_error: status?.n8n_last_error || (configState.configured ? null : configState.reason),
    latest_logs: logs || [],
  };
}

export function buildPriorityLeadEvent(input: { organization: { id: string; name: string }; lead: PriorityLeadEventPayload["lead"]; analysis: PriorityLeadEventPayload["analysis"]; idempotencyKey: string; eventId?: string; occurredAt?: string }): PriorityLeadEventPayload {
  return {
    event_id: input.eventId || crypto.randomUUID(),
    event: "lead.priority_detected",
    occurred_at: input.occurredAt || new Date().toISOString(),
    idempotency_key: input.idempotencyKey,
    organization: input.organization,
    lead: input.lead,
    analysis: input.analysis,
  };
}

export async function createPriorityAlertAndMaybeSend(admin: SupabaseClient, input: { lead: PriorityLeadEventPayload["lead"] & { organization_id: string }; analysis: PriorityLeadEventPayload["analysis"] & { lead_score: number; priority: PriorityLeadEventPayload["lead"]["priority"] } }) {
  const { data: organization } = await admin.from("organizations").select("id, name, score_alert_threshold").eq("id", input.lead.organization_id).maybeSingle();
  if (!organization || input.analysis.lead_score < organization.score_alert_threshold) return { alerted: false, integration: null };

  const dedupeKey = `priority:${input.lead.id}:${input.analysis.lead_score}:${input.analysis.priority}`;
  const { data: recipients } = await admin.from("organization_members").select("user_id").eq("organization_id", organization.id).in("role", ["owner", "admin"]);
  for (const recipient of recipients || []) {
    await admin.from("internal_notifications").insert({
      organization_id: organization.id,
      recipient_user_id: recipient.user_id,
      notification_type: "lead_priority_detected",
      severity: input.analysis.priority === "urgent" ? "error" : "warning",
      title: input.analysis.priority === "urgent" ? "Lead urgente detectado" : "Lead prioritario detectado",
      body: `${input.lead.full_name} tiene un score de ${input.analysis.lead_score}.`,
      link_url: `/dashboard/leads/${input.lead.id}`,
      dedupe_key: dedupeKey,
      metadata: { lead_id: input.lead.id, score: input.analysis.lead_score, priority: input.analysis.priority },
    });
  }
  await admin.from("lead_activities").insert({
    lead_id: input.lead.id,
    organization_id: organization.id,
    type: "notification_sent",
    title: "Alerta interna creada",
    description: "El lead superó el umbral de prioridad de la organización.",
    metadata: { score: input.analysis.lead_score, threshold: organization.score_alert_threshold, priority: input.analysis.priority },
  });

  const idempotencyKey = makeN8nIdempotencyKey({ leadId: input.lead.id, eventName: "lead.priority_detected", score: input.analysis.lead_score, priority: input.analysis.priority });
  const payload = buildPriorityLeadEvent({
    organization: { id: organization.id, name: organization.name },
    lead: input.lead,
    analysis: input.analysis,
    idempotencyKey,
  });
  const integration = await sendN8nEvent({ admin, organizationId: organization.id, leadId: input.lead.id, eventName: "lead.priority_detected", idempotencyKey, payload });
  return { alerted: true, integration };
}
