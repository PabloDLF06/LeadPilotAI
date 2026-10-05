import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { N8nSettingsCard } from "@/components/dashboard/n8n-settings-card";
import { getCurrentOrganizationAccess } from "@/lib/auth/organization-access";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, membership } = await getCurrentOrganizationAccess();
  if (!user) redirect("/login?next=/dashboard/settings");
  if (!membership) redirect("/dashboard");
  return <DashboardShell><main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9"><p className="text-sm font-semibold text-indigo-600">Workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Configuración</h1><p className="mt-2 text-sm text-slate-500">Gestiona integraciones internas y el comportamiento del workspace.</p><div className="mt-8"><N8nSettingsCard canManage={membership.role === "owner" || membership.role === "admin"} /></div></main></DashboardShell>;
}
