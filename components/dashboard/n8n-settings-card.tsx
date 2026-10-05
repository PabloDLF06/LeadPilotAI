"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, Send, TriangleAlert } from "lucide-react";

type Status = { enabled: boolean; configured: boolean; last_status: "not_configured" | "healthy" | "failed" | "unknown"; last_checked_at: string | null; last_error: string | null; latest_logs: Array<{ id: string; event_name: string; status: string; attempt_count: number; executed_at: string }> };

export function N8nSettingsCard({ canManage }: { canManage: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"test" | "retry" | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch("/api/integrations/n8n/status");
    if (response.ok) setStatus(await response.json());
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function runAction(kind: "test" | "retry") {
    const log = status?.latest_logs.find((entry) => entry.status === "failed");
    if (kind === "retry" && !log) return;
    setAction(kind);
    setMessage("");
    const response = await fetch(kind === "test" ? "/api/integrations/n8n/test" : `/api/integrations/n8n/retry/${log?.id}`, { method: "POST" });
    const result = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Evento procesado. Revisa el estado actualizado." : result.error || "No se pudo completar la acción.");
    await load();
    setAction(null);
  }

  const state = !status?.enabled ? "Desactivada" : !status.configured ? "No configurada" : status.last_status === "healthy" ? "Activa" : status.last_status === "failed" ? "Error de conexión" : "Sin comprobar";
  const stateClass = state === "Activa" ? "bg-emerald-50 text-emerald-700" : state === "Error de conexión" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600";
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_rgba(15,23,42,0.03)] sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Integraciones</p><h2 className="mt-2 text-xl font-bold text-slate-950">n8n Automation</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Integración opcional para alertas y sincronizaciones externas. LeadPilot continúa funcionando aunque n8n no esté disponible.</p></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${stateClass}`}>{state === "Activa" ? <CheckCircle2 size={14} /> : state === "Error de conexión" ? <TriangleAlert size={14} /> : null}{state}</span></div><div className="mt-6 grid gap-4 sm:grid-cols-3"><Info label="Última ejecución" value={status?.last_checked_at ? new Date(status.last_checked_at).toLocaleString("es-ES") : "Sin ejecuciones"} /><Info label="Último error" value={status?.last_error || "Ninguno"} /><Info label="Modo" value={!status?.configured ? "Integración simulada / pendiente" : "Servidor interno"} /></div>{message && <p className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">{message}</p>}<div className="mt-6 flex flex-wrap gap-3">{canManage && <button onClick={() => runAction("test")} disabled={loading || Boolean(action)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">{action === "test" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Enviar evento de prueba</button>}{canManage && status?.latest_logs.some((entry) => entry.status === "failed") && <button onClick={() => runAction("retry")} disabled={loading || Boolean(action)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-50">{action === "retry" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Reintentar último fallo</button>}<button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-50"><RefreshCw size={16} /> Actualizar</button></div></section>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-semibold text-slate-700" title={value}>{value}</p></div>; }
