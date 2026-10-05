import { NextResponse } from "next/server";

import { analyzeLead } from "@/lib/ai/analyze-lead";
import { persistLeadAnalysis } from "@/lib/ai/persist-analysis";
import { getCurrentOrganizationAccess } from "@/lib/auth/organization-access";
import { isDemoDatasetLoaded } from "@/lib/demo/demo-data";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const demoLeads = [
  { full_name: "Ana García (demo)", email: "ana.demo@example.com", company: "Clínica Sonrisa Demo", service_interest: "Automatización de WhatsApp", budget_range: "2.000–5.000 €", urgency_input: "Este mes", message: "Queremos automatizar la atención inicial y empezar este mes." },
  { full_name: "Laura Pérez (demo)", email: "laura.demo@example.com", company: "Academia Horizonte Demo", service_interest: "Cualificación de leads", budget_range: "1.000–2.000 €", urgency_input: "Este trimestre", message: "Buscamos responder mejor a las solicitudes de nuestros cursos." },
  { full_name: "Carlos Martín (demo)", email: "carlos.demo@example.com", company: "Inmobiliaria Horizonte Demo", service_interest: "Automatización comercial", budget_range: "Sin definir", urgency_input: "Sin fecha definida", message: "Queremos ordenar el seguimiento de las oportunidades que recibimos." },
];

function reference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `LP-${date}-${crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase()}`;
}

export async function POST() {
  if (process.env.DEMO_MODE !== "true") return NextResponse.json({ error: "La carga demo está desactivada." }, { status: 403 });
  const { user, membership } = await getCurrentOrganizationAccess(["owner", "admin"]);
  if (!user || !membership) return NextResponse.json({ error: "Se requiere una sesión de owner o admin." }, { status: 403 });

  const admin = createAdminClient();
  const { data: existing } = await admin.from("leads").select("organization_id, metadata").eq("organization_id", membership.organization_id).eq("source", "demo").limit(20);
  if (isDemoDatasetLoaded(existing ?? [], membership.organization_id)) return NextResponse.json({ created: 0, alreadyLoaded: true, message: "Los datos demo ya están cargados en esta organización." });

  let created = 0;
  for (const input of demoLeads) {
    const { data: lead, error } = await admin.from("leads").insert({ organization_id: membership.organization_id, public_reference: reference(), full_name: input.full_name, email: input.email, company: input.company, service_interest: input.service_interest, budget_range: input.budget_range, urgency_input: input.urgency_input, message: input.message, source: "demo", analysis_status: "pending", metadata: { demo: true, demo_dataset: "nova-growth-v1" } }).select("id, organization_id, public_reference, full_name, email, phone, company, service_interest, status, created_at").single();
    if (error || !lead) continue;
    created += 1;
    await admin.from("lead_activities").insert({ lead_id: lead.id, organization_id: membership.organization_id, actor_user_id: user.id, type: "lead_created", title: "Lead demo cargado", description: "Registro sintético del dataset Nova Growth.", metadata: { demo: true, demo_dataset: "nova-growth-v1" } });
    const result = await analyzeLead({ fullName: input.full_name, email: input.email, company: input.company, serviceInterest: input.service_interest, budgetRange: input.budget_range, urgencyInput: input.urgency_input, message: input.message });
    await persistLeadAnalysis(admin, lead, result);
  }
  return NextResponse.json({ created, alreadyLoaded: false, message: `${created} leads demo cargados en tu organización.` }, { status: 201 });
}
