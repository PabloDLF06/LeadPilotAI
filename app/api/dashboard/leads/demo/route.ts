import { NextResponse } from "next/server";

import { analyzeLead } from "@/lib/ai/analyze-lead";
import { persistLeadAnalysis } from "@/lib/ai/persist-analysis";
import { getCurrentOrganizationAccess } from "@/lib/auth/organization-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function publicReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase();
  return `LP-${date}-${suffix}`;
}

export async function POST() {
  const { user, membership } = await getCurrentOrganizationAccess();
  if (!user || !membership) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const admin = createAdminClient();
  const demoLead = {
    organization_id: membership.organization_id,
    public_reference: publicReference(),
    full_name: "María López (demo)",
    email: "maria.demo@example.com",
    phone: null,
    company: "Nova Growth Demo",
    service_interest: "Automatización de captación",
    budget_range: "2.000 - 5.000 €",
    urgency_input: "Este mes",
    message: "Queremos mejorar la captación de clientes y automatizar la primera respuesta. Nos gustaría revisar una propuesta esta semana.",
    source: "demo",
    metadata: { demo: true, created_by: user.id },
    analysis_status: "pending",
  };
  const { data: lead, error } = await admin.from("leads").insert(demoLead).select("id, organization_id, public_reference, full_name, email, phone, company, service_interest, status, created_at").single();
  if (error || !lead) return NextResponse.json({ error: "No se pudo crear el lead demo." }, { status: 500 });

  await admin.from("lead_activities").insert({ lead_id: lead.id, organization_id: lead.organization_id, actor_user_id: user.id, type: "lead_created", title: "Lead demo creado", description: "Lead sintético para validar el flujo de análisis.", metadata: { demo: true } });
  try {
    const result = await analyzeLead({ fullName: lead.full_name, email: lead.email, company: lead.company ?? undefined, serviceInterest: lead.service_interest ?? undefined, budgetRange: demoLead.budget_range, urgencyInput: demoLead.urgency_input, message: demoLead.message });
    const analysis = await persistLeadAnalysis(admin, lead, result);
    return NextResponse.json({ leadId: lead.id, reference: lead.public_reference, mode: result.mode, analysis }, { status: 201 });
  } catch {
    await admin.from("leads").update({ analysis_status: "failed" }).eq("id", lead.id).eq("organization_id", lead.organization_id);
    return NextResponse.json({ leadId: lead.id, reference: lead.public_reference, error: "El lead se creó, pero el análisis no pudo completarse." }, { status: 201 });
  }
}
