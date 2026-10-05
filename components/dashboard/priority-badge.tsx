import { cn } from "@/lib/utils/cn";

const styles = { cold: "bg-slate-100 text-slate-600", warm: "bg-amber-50 text-amber-700", hot: "bg-orange-50 text-orange-700", urgent: "bg-rose-50 text-rose-700" };
const labels = { cold: "Cold", warm: "Warm", hot: "Hot", urgent: "Urgente" };

export function PriorityBadge({ priority }: { priority: keyof typeof styles }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", styles[priority])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{labels[priority]}</span>;
}
