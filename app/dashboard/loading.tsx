import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return <main className="min-h-screen bg-[#f7f8fc] p-6 lg:p-10"><div className="mx-auto max-w-6xl"><Skeleton className="h-4 w-28" /><Skeleton className="mt-4 h-9 w-80" /><Skeleton className="mt-3 h-4 w-96 max-w-full" /><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36" />)}</div><div className="mt-6 grid gap-6 lg:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></div></main>;
}
