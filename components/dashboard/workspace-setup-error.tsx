import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export function WorkspaceSetupError() {
  return <DashboardShell><main className="mx-auto max-w-2xl px-5 py-12 lg:px-8"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><AlertTriangle className="h-6 w-6 text-amber-700" aria-hidden="true" /><h1 className="mt-4 text-xl font-bold text-slate-950">No se pudo preparar tu workspace</h1><p className="mt-2 text-sm leading-6 text-slate-700">Tu cuenta existe, pero faltan permisos de servidor o la configuración de Supabase. Revisa las variables server-only y la migración de grants; después vuelve a cargar esta página.</p><Link href="/dashboard" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">Reintentar</Link></div></main></DashboardShell>;
}
