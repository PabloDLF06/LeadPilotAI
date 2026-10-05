"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Clipboard, Loader2, Mail, RefreshCw, Send, Sparkles } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

type Analysis = {
  id: string;
  model: string;
  summary: string | null;
  intent: string | null;
  service_interest: string | null;
  estimated_budget: string | null;
  urgency_level: string | null;
  sentiment: string | null;
  pain_points: unknown;
  objections: unknown;
  recommended_next_action: string | null;
  score_reasoning: string | null;
  confidence: number | null;
  structured_data: { lead_score?: number; suggested_response?: { subject?: string; body?: string } } | null;
};

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  service_interest: string | null;
  budget_range: string | null;
  urgency_input: string | null;
  message: string | null;
  source: string;
  status: string;
  priority: string | null;
  score: number | null;
  analysis_status: string;
  analyzed_at: string | null;
  created_at: string;
};

type Activity = { id: string; type: string; title: string; description: string | null; created_at: string };
type AutomationLog = { id: string; event_name: string; status: string; error_message: string | null; attempt_count: number; executed_at: string };

function list(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function LeadDetail({ lead, analysis, activities, automationLogs }: { lead: Lead; analysis: Analysis | null; activities: Activity[]; automationLogs: AutomationLog[] }) {
  const [currentAnalysis, setCurrentAnalysis] = useState(analysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const response = currentAnalysis?.structured_data?.suggested_response;

  async function regenerate() {
    setLoading(true);
    setError("");
    const result = await fetch(`/api/dashboard/leads/${lead.id}/analyze`, { method: "POST" });
    const payload = await result.json().catch(() => ({}));
    if (!result.ok) setError(payload.error || "No se pudo generar el análisis.");
    else {
      setCurrentAnalysis({ ...currentAnalysis, id: currentAnalysis?.id || "generated", model: payload.model, summary: payload.analysis.summary, intent: payload.analysis.intent, service_interest: payload.analysis.service_interest, estimated_budget: payload.analysis.estimated_budget, urgency_level: payload.analysis.urgency_level, sentiment: payload.analysis.sentiment, pain_points: payload.analysis.pain_points, objections: payload.analysis.objections, recommended_next_action: payload.analysis.recommended_next_action, score_reasoning: payload.analysis.score_reasoning, confidence: payload.analysis.confidence, structured_data: payload.analysis });
    }
    setLoading(false);
  }

  async function copyResponse() {
    if (!response?.body) return;
    await navigator.clipboard.writeText(`${response.subject || ""}\n\n${response.body}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function simulateEmail() {
    if (!response?.body) return;
    setSending(true);
    setError("");
    const result = await fetch(`/api/dashboard/leads/${lead.id}/email`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: response.subject || "Seguimiento de tu consulta", body: response.body }) });
    const payload = await result.json().catch(() => ({}));
    if (!result.ok) setError(payload.error || "No se pudo registrar el envío.");
    else setSent(true);
    setSending(false);
  }

  return <DashboardShell><main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9"><Link href="/dashboard/leads" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Volver a leads</Link><div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-start"><div><p className="text-sm font-semibold text-indigo-600">Detalle del lead</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{lead.full_name}</h1><p className="mt-2 text-sm text-slate-500">{lead.company || lead.email} · recibido el {new Date(lead.created_at).toLocaleDateString("es-ES")}</p></div><button onClick={regenerate} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">{loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} {analysis ? "Regenerar análisis" : "Generar análisis"}</button></div>{error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><div className="space-y-6"><section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_rgba(15,23,42,0.03)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Solicitud original</p><h2 className="mt-2 text-xl font-bold text-slate-950">{lead.service_interest || "Consulta general"}</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">{lead.status}</span></div><p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">{lead.message || "Sin mensaje adicional."}</p><div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2"><Info label="Email" value={lead.email} /><Info label="Teléfono" value={lead.phone || "No indicado"} /><Info label="Presupuesto" value={lead.budget_range || "No indicado"} /><Info label="Urgencia" value={lead.urgency_input || "No indicada"} /></div></section><section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 sm:p-6"><div className="flex items-center gap-2"><Sparkles size={18} className="text-indigo-600" /><h2 className="font-bold text-slate-950">Análisis estructurado</h2></div>{currentAnalysis ? <div className="mt-5 space-y-5"><p className="text-sm leading-6 text-slate-700">{currentAnalysis.summary}</p><div className="grid gap-3 sm:grid-cols-4"><Metric label="Score" value={String(lead.score ?? currentAnalysis.structured_data?.lead_score ?? "—")} /><Metric label="Intención" value={currentAnalysis.intent || "—"} /><Metric label="Urgencia" value={currentAnalysis.urgency_level || "—"} /><Metric label="Confianza" value={`${currentAnalysis.confidence ?? "—"}%`} /></div><div className="grid gap-5 md:grid-cols-2"><Insight title="Puntos de dolor" values={list(currentAnalysis.pain_points)} /><Insight title="Objeciones" values={list(currentAnalysis.objections)} /></div><p className="text-sm text-slate-700"><strong>Siguiente acción:</strong> {currentAnalysis.recommended_next_action || "Revisar manualmente."}</p></div> : <p className="mt-4 text-sm text-slate-600">Todavía no hay análisis. Genera uno para obtener score, prioridad y siguiente acción.</p>}</section></div><div className="space-y-6"><section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_rgba(15,23,42,0.03)] sm:p-6"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Mail size={18} className="text-indigo-600" /><h2 className="font-bold text-slate-950">Respuesta sugerida</h2></div><div className="flex items-center gap-2"><button onClick={copyResponse} disabled={!response?.body} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40"><Clipboard size={14} /> {copied ? "Copiado" : "Copiar"}</button><button onClick={simulateEmail} disabled={!response?.body || sending || sent} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40">{sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {sent ? "Simulado" : "Enviar"}</button></div></div>{response ? <div className="mt-5"><p className="text-sm font-bold text-slate-800">{response.subject}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{response.body}</p></div> : <p className="mt-4 text-sm leading-6 text-slate-500">Genera el análisis para crear una respuesta personalizada.</p>}<p className="mt-4 text-xs text-slate-400">En demo, “Enviar” registra un email simulado y no contacta al destinatario.</p></section><section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_rgba(15,23,42,0.03)] sm:p-6"><h2 className="font-bold text-slate-950">Automatización externa</h2>{automationLogs.length ? <div className="mt-4 space-y-3">{automationLogs.map((log) => <div key={log.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-sm font-semibold text-slate-700">{log.event_name}</p><p className="mt-1 text-xs text-slate-400">{new Date(log.executed_at).toLocaleString("es-ES")} · intento {log.attempt_count}</p>{log.error_message && <p className="mt-1 text-xs text-red-600">{log.error_message}</p>}</div><span className={`rounded-full px-2 py-1 text-[11px] font-bold capitalize ${log.status === "success" ? "bg-emerald-50 text-emerald-700" : log.status === "failed" ? "bg-red-50 text-red-700" : "bg-slate-200 text-slate-600"}`}>{log.status}</span></div>)}</div> : <p className="mt-4 text-sm text-slate-500">Sin eventos externos para este lead.</p>}{automationLogs.some((log) => log.status === "failed") && <Link href="/dashboard/settings" className="mt-4 inline-flex text-xs font-bold text-indigo-600 hover:text-indigo-700">Gestionar reintentos en Integraciones →</Link>}</section><section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_rgba15,23,42,0.03)] sm:p-6"><h2 className="font-bold text-slate-950">Actividad</h2><div className="mt-4 space-y-4">{activities.length ? activities.map((activity) => <div key={activity.id} className="border-l-2 border-indigo-100 pl-3"><p className="text-sm font-semibold text-slate-800">{activity.title}</p><p className="mt-1 text-xs text-slate-400">{new Date(activity.created_at).toLocaleString("es-ES")}</p>{activity.description && <p className="mt-1 text-sm text-slate-500">{activity.description}</p>}</div>) : <p className="text-sm text-slate-500">Aún no hay actividad registrada.</p>}</div></section></div></div></main></DashboardShell>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-700">{value}</p></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/80 bg-white/70 p-3"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-bold capitalize text-slate-800">{value}</p></div>; }
function Insight({ title, values }: { title: string; values: string[] }) { return <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>{values.length ? <ul className="mt-2 space-y-1 text-sm text-slate-700">{values.map((value) => <li key={value}>• {value}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">Ninguna detectada.</p>}</div>; }
