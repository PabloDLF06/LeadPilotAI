import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/leads");
  const { data: membership } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).limit(1).maybeSingle();
  const { data: leads } = membership ? await supabase.from("leads").select("id, full_name, email, company, service_interest, priority, score, status, analysis_status, created_at").eq("organization_id", membership.organization_id).order("created_at", { ascending: false }).limit(50) : { data: [] };

  return <DashboardShell><main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9"><p className="text-sm font-semibold text-indigo-600">Gestión de leads</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Leads</h1><p className="mt-2 text-sm text-slate-500">Revisa cada oportunidad, su análisis y la respuesta sugerida.</p>{leads?.length ? <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_5px_24px_rgba(15,23,42,0.03)]"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3 font-semibold">Lead</th><th className="px-5 py-3 font-semibold">Interés</th><th className="px-5 py-3 font-semibold">Prioridad</th><th className="px-5 py-3 font-semibold">Score</th><th className="px-5 py-3 font-semibold">Análisis</th><th /></tr></thead><tbody className="divide-y divide-slate-100">{leads.map((lead) => <tr key={lead.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-bold text-slate-800">{lead.full_name}</p><p className="mt-1 text-xs text-slate-400">{lead.company || lead.email}</p></td><td className="px-5 py-4 text-slate-600">{lead.service_interest || "Consulta general"}</td><td className="px-5 py-4"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold capitalize text-indigo-700">{lead.priority || "pendiente"}</span></td><td className="px-5 py-4 font-bold text-slate-800">{lead.score ?? "—"}</td><td className="px-5 py-4 text-xs font-semibold capitalize text-slate-500">{lead.analysis_status}</td><td className="px-5 py-4 text-right"><Link href={`/dashboard/leads/${lead.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">Abrir <ArrowRight size={14} /></Link></td></tr>)}</tbody></table></div></section> : <div className="mt-8"><EmptyState icon={Users} eyebrow="Gestión de leads" title="Todavía no hay leads" description="Comparte tu formulario público para recibir la primera oportunidad." action="Crear lead" actionHref="/dashboard/leads/new" /></div>}</main></DashboardShell>;
}
