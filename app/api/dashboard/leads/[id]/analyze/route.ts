import { NextResponse } from "next/server";

import { analyzeLead } from "@/lib/ai/analyze-lead";
import { persistLeadAnalysis } from "@/lib/ai/persist-analysis";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, organization_id, public_reference, full_name, email, phone, company, service_interest, budget_range, urgency_input, message, status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !lead) return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });

  try {
    const result = await analyzeLead({
      fullName: lead.full_name,
      email: lead.email,
      company: lead.company || undefined,
      serviceInterest: lead.service_interest || undefined,
      budgetRange: lead.budget_range || undefined,
      urgencyInput: lead.urgency_input || undefined,
      message: lead.message || "",
    });
    const analysis = await persistLeadAnalysis(createAdminClient(), { id: lead.id, organization_id: lead.organization_id, public_reference: lead.public_reference, full_name: lead.full_name, email: lead.email, phone: lead.phone, company: lead.company, service_interest: lead.service_interest, status: lead.status, created_at: lead.created_at }, result);
    return NextResponse.json({ analysis, model: result.model, mode: result.mode, attempts: result.attempts });
  } catch {
    await createAdminClient().from("leads").update({ analysis_status: "failed" }).eq("id", lead.id).eq("organization_id", lead.organization_id);
    return NextResponse.json({ error: "No se pudo generar el análisis." }, { status: 502 });
  }
}
