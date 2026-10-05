import { NextResponse } from "next/server";

import { analyzeLead } from "@/lib/ai/analyze-lead";
import { persistLeadAnalysis } from "@/lib/ai/persist-analysis";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashClientIp, assertPublicRateLimit, getClientIp } from "@/lib/security/public-rate-limit";
import { publicLeadSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";

type ApiEvent = { event_type: string; form_id?: string; ip_hash: string; user_agent?: string; payload_summary: Record<string, unknown>; status_code: number };

async function logApiEvent(admin: ReturnType<typeof createAdminClient>, event: ApiEvent) {
  await admin.from("api_events").insert(event);
}

function reference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LP-${date}-${suffix}`;
}

export async function POST(request: Request) {
  const ipHash = hashClientIp(getClientIp(request.headers));
  const userAgent = request.headers.get("user-agent") || undefined;
  const admin = createAdminClient();

  if (Number(request.headers.get("content-length") || 0) > 20_000) {
    await logApiEvent(admin, { event_type: "public_lead_rejected", ip_hash: ipHash, user_agent: userAgent, payload_summary: { reason: "payload_too_large" }, status_code: 413 });
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }

  try {
    await assertPublicRateLimit(ipHash);
  } catch (error) {
    if (error instanceof Error && error.message === "rate_limit_exceeded") {
      await logApiEvent(admin, { event_type: "public_lead_rejected", ip_hash: ipHash, user_agent: userAgent, payload_summary: { reason: "rate_limit" }, status_code: 429 });
      return NextResponse.json({ error: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." }, { status: 429 });
    }
    return NextResponse.json({ error: "No se pudo validar la solicitud." }, { status: 500 });
  }

  await logApiEvent(admin, { event_type: "public_lead_attempt", ip_hash: ipHash, user_agent: userAgent, payload_summary: { source: "public_form" }, status_code: 202 });

  const payload = await request.json().catch(() => null);
  const parsed = publicLeadSchema.safeParse(payload);
  if (!parsed.success) {
    await logApiEvent(admin, { event_type: "public_lead_rejected", ip_hash: ipHash, user_agent: userAgent, payload_summary: { reason: "validation" }, status_code: 400 });
    return NextResponse.json({ error: "Revisa los datos del formulario." }, { status: 400 });
  }

  const input = parsed.data;
  if (input.honeypot || (input.submittedAt && Date.now() - input.submittedAt < 1500)) {
    await logApiEvent(admin, { event_type: "public_lead_rejected", form_id: input.formPublicId, ip_hash: ipHash, user_agent: userAgent, payload_summary: { reason: input.honeypot ? "honeypot" : "submitted_too_fast" }, status_code: 400 });
    return NextResponse.json({ error: "No se pudo procesar la solicitud." }, { status: 400 });
  }

  const { data: form, error: formError } = await admin
    .from("forms")
    .select("id, public_id, organization_id, name, is_active")
    .eq("public_id", input.formPublicId)
    .eq("is_active", true)
    .maybeSingle();

  if (formError || !form) {
    await logApiEvent(admin, { event_type: "public_lead_rejected", form_id: input.formPublicId, ip_hash: ipHash, user_agent: userAgent, payload_summary: { reason: "form_not_found" }, status_code: 404 });
    return NextResponse.json({ error: "Formulario no encontrado." }, { status: 404 });
  }

  const data = { ...input, formPublicId: undefined, honeypot: undefined, submittedAt: undefined };
  let lead: { id: string; public_reference: string; status: "new" | "contacted" | "qualified" | "won" | "lost" | "archived"; created_at: string } | null = null;
  for (let attempt = 0; attempt < 3 && !lead; attempt += 1) {
    const result = await admin.from("leads").insert({ organization_id: form.organization_id, form_id: form.id, public_reference: reference(), full_name: data.fullName, email: data.email, phone: data.phone || null, company: data.company || null, service_interest: data.serviceInterest || null, budget_range: data.budgetRange || null, urgency_input: data.urgencyInput || null, message: data.message, source: "form", analysis_status: "pending", metadata: { consent: Boolean(data.consent), source: "public_form" } }).select("id, public_reference, status, created_at").single();
    lead = result.data;
  }

  if (!lead) {
    await logApiEvent(admin, { event_type: "public_lead_error", form_id: form.id, ip_hash: ipHash, user_agent: userAgent, payload_summary: { reason: "lead_insert" }, status_code: 500 });
    return NextResponse.json({ error: "No se pudo guardar la solicitud." }, { status: 500 });
  }

  await admin.from("lead_activities").insert({ lead_id: lead.id, organization_id: form.organization_id, type: "lead_created", title: "Lead recibido", description: "Solicitud recibida desde el formulario público.", metadata: { source: "public_form" } });

  try {
    const result = await analyzeLead({ fullName: input.fullName, email: input.email, company: input.company, serviceInterest: input.serviceInterest, budgetRange: input.budgetRange, urgencyInput: input.urgencyInput, message: input.message });
    await persistLeadAnalysis(admin, { id: lead.id, organization_id: form.organization_id, public_reference: lead.public_reference, full_name: input.fullName, email: input.email, phone: input.phone || null, company: input.company || null, service_interest: input.serviceInterest || null, status: lead.status, created_at: lead.created_at }, result);
  } catch {
    await admin.from("leads").update({ analysis_status: "failed" }).eq("id", lead.id).eq("organization_id", form.organization_id);
    await admin.from("automation_logs").insert({ organization_id: form.organization_id, lead_id: lead.id, automation_name: "lead-received", event_name: "analysis", status: "failed", error_message: "analysis_failed", request_payload: { source: "public_form" } });
  }

  await admin.from("automation_logs").insert({ organization_id: form.organization_id, lead_id: lead.id, automation_name: "lead-received", event_name: "webhook", status: "skipped", response_payload: { reason: "n8n_not_configured_in_base_flow" }, request_payload: { source: "public_form" } });
  await logApiEvent(admin, { event_type: "public_lead_created", form_id: form.id, ip_hash: ipHash, user_agent: userAgent, payload_summary: { lead_id: lead.id, source: "public_form" }, status_code: 201 });

  return NextResponse.json({ success: true, reference: lead.public_reference, message: "Hemos recibido tu solicitud." }, { status: 201 });
}
