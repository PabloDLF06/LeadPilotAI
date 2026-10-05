"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, CheckCircle2, Loader2 } from "lucide-react";

export function DemoLeadForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingDataset, setLoadingDataset] = useState(false);

  async function createDemoLead() {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/dashboard/leads/demo", { method: "POST" });
      const payload = await response.json() as { leadId?: string; error?: string };
      if (!response.ok || !payload.leadId) throw new Error(payload.error ?? "No se pudo crear el lead.");
      router.push(`/dashboard/leads/${payload.leadId}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear el lead demo.");
      setPending(false);
    }
  }

  async function loadDataset() {
    setLoadingDataset(true);
    setMessage(null);
    try {
      const response = await fetch("/api/dashboard/demo-data", { method: "POST" });
      const payload = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "No se pudo cargar el dataset demo.");
      setMessage(payload.message ?? "Dataset demo cargado.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar el dataset demo.");
    } finally {
      setLoadingDataset(false);
    }
  }

  return <main className="mx-auto max-w-3xl px-5 py-7 lg:px-8 lg:py-9"><button type="button" onClick={() => router.back()} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Volver</button><div className="mt-7 rounded-2xl border border-indigo-100 bg-white p-6 shadow-[0_5px_24px_rgba(15,23,42,0.04)] sm:p-8"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Bot className="h-6 w-6" aria-hidden="true" /></span><p className="mt-5 text-sm font-semibold text-indigo-600">Flujo de demostración</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Crear lead demo</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Crea una oportunidad sintética en tu organización actual y ejecuta el mismo análisis estructurado que usa el formulario público. En DEMO_MODE no se llama a OpenAI.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{["Lead persistido", "Score y prioridad", "Alerta interna"].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />{item}</div>)}</div>{message && <p role="status" className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}<div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={createDemoLead} disabled={pending || loadingDataset} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">{pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{pending ? "Creando y analizando…" : "Crear lead demo"}</button><button type="button" onClick={loadDataset} disabled={pending || loadingDataset} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">{loadingDataset && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{loadingDataset ? "Cargando dataset…" : "Cargar dataset demo"}</button></div><p className="mt-3 text-xs leading-5 text-slate-500">La etiqueta demo queda guardada en el lead y no modifica los datos de otras organizaciones. El dataset completo es idempotente.</p></div></main>;
}
