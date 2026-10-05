import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { WorkspaceSetupError } from "@/components/dashboard/workspace-setup-error";
import { bootstrapOrganization } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: membership } = await supabase.from("organization_members").select("organization_id, organizations(name)").eq("user_id", user.id).limit(1).maybeSingle();
  const currentMembership = membership;
  if (!currentMembership?.organization_id) {
    try {
      await bootstrapOrganization(user.id, typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "");
      redirect("/dashboard");
    } catch {
      return <WorkspaceSetupError />;
    }
  }
  const organizationId = currentMembership.organization_id;
  const organization = Array.isArray(currentMembership.organizations) ? currentMembership.organizations[0] : currentMembership.organizations;

  const base = supabase.from("leads").select("id, full_name, email, company, service_interest, priority, score, status, created_at", { count: "exact", head: true }).eq("organization_id", organizationId);
  const [all, fresh, hot, qualified, won, cold, warm, priorityHot, urgent, recent, attention, form] = await Promise.all([
    base,
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "new"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("priority", ["hot", "urgent"]),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["qualified", "won"]),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "won"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("priority", "cold"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("priority", "warm"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("priority", "hot"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("priority", "urgent"),
    supabase.from("leads").select("id, full_name, email, company, service_interest, priority, score, status, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(5),
    supabase.from("leads").select("id, full_name, email, company, service_interest, priority, score, status, created_at").eq("organization_id", organizationId).gte("score", 65).order("score", { ascending: false }).limit(3),
    supabase.from("forms").select("public_id").eq("organization_id", organizationId).eq("is_active", true).order("created_at", { ascending: true }).limit(1).maybeSingle(),
  ]);
  const totalLeads = all.count ?? 0;
  return <DashboardOverview data={{ organizationName: organization?.name || "Tu workspace", formPublicId: form.data?.public_id ?? null, totalLeads, newLeads: fresh.count ?? 0, hotLeads: hot.count ?? 0, qualifiedRate: totalLeads ? Math.round(((qualified.count ?? 0) / totalLeads) * 1000) / 10 : 0, wonLeads: won.count ?? 0, priorityCounts: { cold: cold.count ?? 0, warm: warm.count ?? 0, hot: priorityHot.count ?? 0, urgent: urgent.count ?? 0 }, leads: (recent.data ?? []) as never, attentionLeads: (attention.data ?? []) as never }} />;
}
