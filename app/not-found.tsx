import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5"><div className="max-w-md text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">404</p><h1 className="mt-3 text-3xl font-bold text-slate-950">Esta página no existe</h1><p className="mt-3 text-sm leading-6 text-slate-500">Puede que el enlace haya cambiado o que no tengas acceso a este recurso.</p><Link href="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Volver al inicio</Link></div></main>;
}
