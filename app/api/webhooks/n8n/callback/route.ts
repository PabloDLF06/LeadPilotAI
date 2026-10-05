import { NextResponse } from "next/server";

import { callbackSchema, isN8nTimestampFresh, verifyN8nCallbackSignature } from "@/lib/integrations/n8n";
import { getN8nConfig } from "@/lib/integrations/n8n-env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return NextResponse.json({ error: "content_type_required" }, { status: 415 });
  const timestamp = request.headers.get("x-leadpilot-timestamp") || "";
  const signature = request.headers.get("x-leadpilot-signature") || "";
  if (!isN8nTimestampFresh(timestamp)) return NextResponse.json({ error: "timestamp_expired" }, { status: 401 });
  if (!getN8nConfig()?.callbackSecret) return NextResponse.json({ error: "callback_not_configured" }, { status: 503 });

  const rawBody = await request.text();
  if (!verifyN8nCallbackSignature(timestamp, rawBody, signature)) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = callbackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid_callback" }, { status: 400 });

  const admin = createAdminClient();
  const callback = parsed.data;
  const status = callback.status === "success" ? "success" : "failed";
  const { data: log } = await admin.from("automation_logs").select("id, organization_id, status").eq("idempotency_key", callback.idempotency_key).maybeSingle();
  if (!log) return NextResponse.json({ received: false, reason: "log_not_found" }, { status: 404 });
  await admin.from("automation_logs").update({ status, response_payload: { callback_event: callback.event, message: callback.message || null }, error_message: status === "failed" ? (callback.message || "callback_failed") : null, executed_at: new Date().toISOString() }).eq("id", log.id).eq("organization_id", log.organization_id);
  if (status === "failed") await admin.from("internal_notifications").insert({ organization_id: log.organization_id, notification_type: "n8n_callback_failed", severity: "error", title: "n8n informó un fallo", body: callback.message || "La automatización externa falló.", dedupe_key: `callback-failed:${log.id}:${callback.event}`, metadata: { automation_log_id: log.id, event: callback.event } });
  return NextResponse.json({ received: true, updated: true });
}
