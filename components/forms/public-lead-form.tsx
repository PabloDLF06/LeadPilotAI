"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

type PublicForm = { public_id: string; organization_name: string; name: string; title: string; subtitle: string | null; success_title: string; success_message: string; primary_color: string; privacy_text: string | null };

export function PublicLeadForm({ form }: { form: PublicForm }) {
  const router = useRouter();
  const [startedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/public/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formPublicId: form.public_id, fullName: formData.get("fullName"), email: formData.get("email"), phone: formData.get("phone"), company: formData.get("company"), serviceInterest: formData.get("serviceInterest"), budgetRange: formData.get("budgetRange"), urgencyInput: formData.get("urgencyInput"), message: formData.get("message"), consent: formData.get("consent") === "on", honeypot: formData.get("website"), submittedAt: startedAt }) });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(body.error || "No se pudo enviar tu solicitud. Inténtalo de nuevo.");
      return;
    }
    router.push(`/f/${form.public_id}/success?reference=${encodeURIComponent(body.reference)}`);
  }

  return <main className="min-h-screen bg-slate-50 px-5 py-10 sm:py-16"><div className="mx-auto max-w-3xl"><div className="mb-8 flex items-center justify-between"><div><p className="text-sm font-bold text-slate-950">{form.organization_name}</p><p className="mt-1 text-xs text-slate-500">Formulario de contacto</p></div><span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" /> Datos protegidos</span></div><section className="overflow-hidden rounded-3xl bg-white shadow-[0_16px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200"><div className="p-7 sm:p-10" style={{ borderTop: `5px solid ${form.primary_color}` }}><p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: form.primary_color }}>{form.name}</p><h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{form.title}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">{form.subtitle || "Cuéntanos qué necesitas y te responderemos lo antes posible."}</p><form onSubmit={submit} className="mt-8 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Nombre completo" name="fullName" required placeholder="Ana García" /><Field label="Email" name="email" type="email" required placeholder="ana@empresa.com" /><Field label="Teléfono" name="phone" placeholder="+34 600 000 000" /><Field label="Empresa" name="company" placeholder="Empresa SL" /></div><div className="grid gap-5 sm:grid-cols-2"><Field label="¿Qué servicio te interesa?" name="serviceInterest" placeholder="Automatización de ventas" /><Field label="Presupuesto aproximado" name="budgetRange" placeholder="2.000–5.000 €" /><Field label="¿Cuándo quieres empezar?" name="urgencyInput" placeholder="Este mes" /></div><label className="block text-sm font-semibold text-slate-700">Cuéntanos qué necesitas<span className="ml-1 text-rose-500">*</span><textarea name="message" required minLength={10} maxLength={5000} rows={5} placeholder="Describe brevemente tu reto o proyecto..." className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" /></label><label className="hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label><label className="flex items-start gap-3 text-xs leading-5 text-slate-500"><input name="consent" type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />Acepto que {form.organization_name} trate mis datos para responder a esta solicitud.</label>{form.privacy_text ? <p className="text-xs leading-5 text-slate-400">{form.privacy_text}</p> : null}{error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</p> : null}<button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-lg transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: form.primary_color }}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Enviando solicitud…</> : <>Enviar solicitud <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}</button></form></div></section><p className="mt-5 text-center text-xs text-slate-400">Al enviar, recibirás una confirmación en esta página.</p></div></main>;
}

function Field({ label, name, type = "text", required = false, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder: string }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}{required ? <span className="ml-1 text-rose-500">*</span> : null}<input name={name} type={type} required={required} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" /></label>;
}
