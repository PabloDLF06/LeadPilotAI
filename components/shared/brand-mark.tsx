import { Radar } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function BrandMark({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return <div className="flex items-center gap-3"><span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", light ? "bg-white/15 text-white" : "bg-indigo-600 text-white")}><Radar className="h-5 w-5" aria-hidden="true" /></span>{compact ? null : <span className={cn("text-[15px] font-bold tracking-tight", light ? "text-white" : "text-slate-950")}>LeadPilot <span className={light ? "text-indigo-200" : "text-indigo-600"}>AI</span></span>}</div>;
}
