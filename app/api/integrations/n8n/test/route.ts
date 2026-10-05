import { NextResponse } from "next/server";

import { getCurrentOrganizationAccess } from "@/lib/auth/organization-access";
import { buildPriorityLeadEvent, sendN8nEvent } from "@/lib/integrations/n8n";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const { user, membership } = await getCurrentOrganizationAccess(["owner", "admin"]);
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!membership) return NextResponse.json({ error: "Se requiere rol owner o admin." }, { status: 403 });

  const admin = createAdminClient();
  const { data: organization } = await admin.from("organizations").select("id, name").eq("id", membership.organization_id).maybeSingle();
  if (!organization) return NextResponse.json({ error: "Workspace no encontrado." }, { status: 404 });

  const demoLeadId = crypto.randomUUID();
  const idempotencyKey = `test:${membership.organization_id}:${Date.now()}`;
  const payload = buildPriorityLeadEvent({
    organization,
    idempotencyKey,
    lead: { id: demoLeadId, reference: "LP-TEST-0001", full_name: "Lead de prueba", email: "demo@example.com", phone: null, company: "LeadPilot Demo", service_interest: "Evento n8n", score: 82, priority: "urgent", status: "new", created_at: new Date().toISOString() },
    analysis: { summary: "Evento de prueba seguro sin lead real.", recommended_next_action: "Verificar la integración." },
  });
  const result = await sendN8nEvent({ admin, organizationId: organization.id, eventName: "lead.priority_detected", idempotencyKey, payload });
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
