import type { SupabaseClient } from "@supabase/supabase-js";

import type { LeadAnalysisResult } from "@/lib/ai/analyze-lead";
import { createPriorityAlertAndMaybeSend } from "@/lib/integrations/n8n";

export async function persistLeadAnalysis(admin: SupabaseClient, lead: { id: string; organization_id: string; public_reference: string; full_name: string; email: string; phone: string | null; company: string | null; service_interest: string | null; status: "new" | "contacted" | "qualified" | "won" | "lost" | "archived"; created_at: string }, result: LeadAnalysisResult) {
  const { analysis, model, mode, attempts } = result;
  const analysisRow = {
    lead_id: lead.id,
    organization_id: lead.organization_id,
    model,
    prompt_version: "v2-structured-output",
    summary: analysis.summary,
    intent: analysis.intent,
    service_interest: analysis.service_interest,
    estimated_budget: analysis.estimated_budget,
    urgency_level: analysis.urgency_level,
    sentiment: analysis.sentiment,
    pain_points: analysis.pain_points,
    objections: analysis.objections,
    recommended_next_action: analysis.recommended_next_action,
    score_reasoning: analysis.score_reasoning,
    confidence: analysis.confidence,
    structured_data: analysis,
    raw_response: { mode, attempts },
  };

  const { error: analysisError } = await admin.from("lead_ai_analyses").upsert(analysisRow, { onConflict: "lead_id" });
  if (analysisError) throw analysisError;

  const { error: leadError } = await admin
    .from("leads")
    .update({ score: analysis.lead_score, priority: analysis.priority, analysis_status: "completed", analyzed_at: new Date().toISOString() })
    .eq("id", lead.id)
    .eq("organization_id", lead.organization_id);
  if (leadError) throw leadError;

  const { error: activityError } = await admin.from("lead_activities").insert({
    lead_id: lead.id,
    organization_id: lead.organization_id,
    type: "lead_analyzed",
    title: mode === "demo" ? "Análisis demo completado" : "Análisis IA completado",
    description: "Se ha generado un análisis estructurado y una respuesta sugerida.",
    metadata: { model, mode, attempts, score: analysis.lead_score, priority: analysis.priority },
  });
  if (activityError) throw activityError;

  await createPriorityAlertAndMaybeSend(admin, {
    lead: {
      id: lead.id,
      organization_id: lead.organization_id,
      reference: lead.public_reference,
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      service_interest: lead.service_interest,
      score: analysis.lead_score,
      priority: analysis.priority,
      status: lead.status,
      created_at: lead.created_at,
    },
    analysis: {
      summary: analysis.summary,
      recommended_next_action: analysis.recommended_next_action,
      lead_score: analysis.lead_score,
      priority: analysis.priority,
    },
  });

  return analysis;
}
