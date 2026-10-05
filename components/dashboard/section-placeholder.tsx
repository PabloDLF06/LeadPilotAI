import type { LucideIcon } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";

export function SectionPlaceholder({ icon, eyebrow, title, description, action, actionHref }: { icon: LucideIcon; eyebrow: string; title: string; description: string; action?: string; actionHref?: string }) {
  return <DashboardShell><main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9"><div><p className="text-sm font-semibold text-indigo-600">Workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div><div className="mt-8"><EmptyState icon={icon} eyebrow={eyebrow} title="Esta sección está preparada" description="La base visual está lista. En la siguiente fase conectaremos datos, filtros y acciones con Supabase." action={action} actionHref={actionHref} /></div></main></DashboardShell>;
}
