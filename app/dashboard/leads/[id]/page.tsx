import { notFound } from "next/navigation";

import { LeadDetail } from "@/components/dashboard/lead-detail";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, full_name, email, phone, company, website, service_interest, budget_range, urgency_input, message, source, status, priority, score, analysis_status, analyzed_at, created_at, organization_id")
    .eq("id", id)
    .maybeSingle();
  if (error || !lead) notFound();

  const [{ data: analysis }, { data: activities }, { data: automationLogs }] = await Promise.all([
    supabase.from("lead_ai_analyses").select("id, model, prompt_version, summary, intent, service_interest, estimated_budget, urgency_level, sentiment, pain_points, objections, recommended_next_action, score_reasoning, confidence, structured_data, created_at, updated_at").eq("lead_id", id).maybeSingle(),
    supabase.from("lead_activities").select("id, type, title, description, metadata, created_at").eq("lead_id", id).order("created_at", { ascending: false }).limit(10),
    supabase.from("automation_logs").select("id, event_name, status, error_message, attempt_count, executed_at").eq("lead_id", id).eq("automation_name", "n8n").order("executed_at", { ascending: false }).limit(5),
  ]);

  return <LeadDetail lead={lead} analysis={analysis} activities={activities ?? []} automationLogs={automationLogs ?? []} />;
}
