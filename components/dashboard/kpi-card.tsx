import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function KpiCard({ icon: Icon, label, value, change, tone = "indigo", note }: { icon: LucideIcon; label: string; value: string; change?: string; tone?: "indigo" | "amber" | "emerald" | "rose"; note?: string }) {
  const tones = { indigo: "bg-indigo-50 text-indigo-600", amber: "bg-amber-50 text-amber-600", emerald: "bg-emerald-50 text-emerald-600", rose: "bg-rose-50 text-rose-600" };
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_rgba(15,23,42,0.03)]"><div className="flex items-start justify-between"><span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>{change ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">{change}</span> : null}</div><p className="mt-5 text-sm font-medium text-slate-500">{label}</p><div className="mt-1 flex items-baseline gap-2"><p className="text-2xl font-bold tracking-tight text-slate-950">{value}</p>{note ? <span className="text-xs text-slate-400">{note}</span> : null}</div></article>;
}
