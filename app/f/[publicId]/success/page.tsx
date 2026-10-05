import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default async function PublicFormSuccessPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12"><section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-[0_16px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 sm:p-12"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-7 w-7" aria-hidden="true" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Solicitud recibida</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">¡Gracias por contactarnos!</h1><p className="mt-4 text-sm leading-7 text-slate-500">Hemos recibido tu solicitud y te responderemos lo antes posible.</p>{reference ? <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">Referencia <strong className="text-slate-800">{reference}</strong></p> : null}<Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">Volver al inicio <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></section></main>;
}
