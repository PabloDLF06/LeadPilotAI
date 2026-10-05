import type { Metadata } from "next";
import { Copy } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentOrganizationAccess } from "@/lib/auth/organization-access";

export const metadata: Metadata = { title: "Formulario y embed | LeadPilot AI" };

export default async function EmbedPage() {
  const { user, membership, supabase } = await getCurrentOrganizationAccess();
  if (!user || !membership) return null;
  const { data: form } = await supabase.from("forms").select("public_id, title").eq("organization_id", membership.organization_id).eq("is_active", true).limit(1).maybeSingle();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publicUrl = form ? `${baseUrl}/f/${form.public_id}` : null;
  const iframe = publicUrl ? `<iframe src="${publicUrl}" title="Formulario de contacto" width="100%" height="900" loading="lazy"></iframe>` : "";
  return <DashboardShell><main className="mx-auto max-w-4xl px-5 py-7 lg:px-8 lg:py-9"><p className="text-sm font-semibold text-indigo-600">Captación</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Formulario y embed</h1><p className="mt-2 text-sm text-slate-500">Comparte una URL pública o inserta el formulario en tu web.</p>{publicUrl ? <div className="mt-8 space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-950">URL pública</h2><p className="mt-3 break-all rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{publicUrl}</p><a href={publicUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">Abrir formulario</a></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><Copy className="h-5 w-5 text-indigo-600" aria-hidden="true" /><h2 className="font-bold text-slate-950">Código iframe</h2></div><pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200"><code>{iframe}</code></pre><p className="mt-3 text-xs text-slate-500">El endpoint público mantiene validación, honeypot y rate limit.</p></section></div> : <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">No hay un formulario activo en esta organización.</div>}</main></DashboardShell>;
}
