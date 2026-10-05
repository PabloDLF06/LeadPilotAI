import type { Metadata } from "next";
import { subDays, startOfDay } from "date-fns";

import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { aggregateAnalytics, type AnalyticsLead } from "@/lib/analytics/aggregate";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Analítica | LeadPilot AI" };

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const params = await searchParams;
  const range = params.range === "7" || params.range === "90" ? Number(params.range) : 30;
  const days = range as 7 | 30 | 90;
  const to = new Date();
  const from = startOfDay(subDays(to, days - 1));
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <AnalyticsView data={aggregateAnalytics([], from, to)} days={days} demoMode={process.env.DEMO_MODE === "true"} />;
  const { data: membership } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership?.organization_id) return <AnalyticsView data={aggregateAnalytics([], from, to)} days={days} demoMode={process.env.DEMO_MODE === "true"} />;
  const { data: leads } = await supabase.from("leads").select("created_at, priority, status, service_interest, last_contacted_at").eq("organization_id", membership.organization_id).gte("created_at", from.toISOString()).lte("created_at", to.toISOString()).order("created_at", { ascending: true }).limit(5000);
  return <AnalyticsView data={aggregateAnalytics((leads ?? []) as AnalyticsLead[], from, to)} days={days} demoMode={process.env.DEMO_MODE === "true"} />;
}
