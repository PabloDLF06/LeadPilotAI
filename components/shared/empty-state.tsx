import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function EmptyState({ icon: Icon, eyebrow, title, description, action, actionHref, className }: { icon: LucideIcon; eyebrow?: string; title: string; description: string; action?: string; actionHref?: string; className?: string }) {
  return <div className={cn("flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center", className)}><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" aria-hidden="true" /></span>{eyebrow ? <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p> : null}<h3 className="mt-2 text-base font-bold text-slate-950">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>{action && actionHref ? <Link href={actionHref} className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">{action}</Link> : null}</div>;
}
