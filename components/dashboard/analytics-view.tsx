"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Clock3, Flame, Target, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AnalyticsSnapshot } from "@/lib/analytics/aggregate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { KpiCard } from "@/components/dashboard/kpi-card";

const priorityColors = ["#cbd5e1", "#f59e0b", "#f97316", "#e11d48"];
const statusLabels: Record<string, string> = { new: "Nuevos", contacted: "Contactados", qualified: "Cualificados", won: "Ganados", lost: "Perdidos", archived: "Archivados" };

export function AnalyticsView({ data, days, demoMode }: { data: AnalyticsSnapshot; days: 7 | 30 | 90; demoMode: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const setRange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("range", value);
    router.push(`${pathname}?${next.toString()}`);
  };
  const hasData = data.total > 0;

  return <DashboardShell><main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-semibold text-indigo-600">Rendimiento comercial</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Analítica</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Decisiones basadas en los leads de tu organización, sin métricas estimadas.</p></div><div className="flex items-center gap-2"><label htmlFor="analytics-range" className="sr-only">Rango de fechas</label><select id="analytics-range" value={days} onChange={(event) => setRange(event.target.value)} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option></select>{demoMode && <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">DEMO_MODE</span>}</div></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><KpiCard icon={Users} label="Leads totales" value={String(data.total)} note={`últimos ${days} días`} /><KpiCard icon={TrendingUp} label="Nuevos" value={String(data.newLeads)} note="sin contactar" /><KpiCard icon={Flame} label="Prioritarios" value={String(data.priorityLeads)} tone="amber" note="hot + urgentes" /><KpiCard icon={Target} label="Cualificación" value={data.qualificationRate === null ? "—" : `${data.qualificationRate}%`} tone="emerald" note="qualified + won" /><KpiCard icon={Clock3} label="Primer contacto" value={data.averageFirstContactHours === null ? "—" : `${data.averageFirstContactHours} h`} tone="rose" note="con datos disponibles" /></div>
    {!hasData ? <div className="mt-6"><EmptyState icon={BarChart3} eyebrow="Sin datos suficientes" title="Aún no hay actividad en este rango" description="Recibe o crea un lead para empezar a ver tendencias. Las tasas permanecen vacías hasta que existan registros reales." action="Crear lead demo" actionHref="/dashboard/leads/new" /></div> : <>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.75fr)]"><ChartCard title="Leads por día" description={`Entradas en los últimos ${days} días`}><ResponsiveContainer width="100%" height={290}><LineChart data={data.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} interval={days === 90 ? 13 : days === 30 ? 6 : 0} /><YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} /><Tooltip /><Line type="monotone" dataKey="leads" name="Leads" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></ChartCard><ChartCard title="Prioridad" description="Distribución del score"><ResponsiveContainer width="100%" height={290}><PieChart><Pie data={data.priorities} dataKey="value" nameKey="name" innerRadius={72} outerRadius={108} paddingAngle={3}>{data.priorities.map((entry, index) => <Cell key={entry.name} fill={priorityColors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="-mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">{data.priorities.map((item, index) => <span key={item.name} className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: priorityColors[index] }} />{item.name}: <strong>{item.value}</strong></span>)}</div></ChartCard></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2"><ChartCard title="Estado comercial" description="Progreso de las oportunidades"><ResponsiveContainer width="100%" height={280}><BarChart data={data.statuses} layout="vertical" margin={{ left: 15, right: 15 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} /><YAxis type="category" dataKey="name" tickFormatter={(value) => statusLabels[value] ?? value} width={85} tick={{ fontSize: 11, fill: "#64748b" }} /><Tooltip /><Bar dataKey="value" name="Leads" fill="#6366f1" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Servicios solicitados" description="Intereses más repetidos"><div className="space-y-4 pt-4">{data.services.length ? data.services.map((item) => <div key={item.name}><div className="mb-1 flex justify-between gap-4 text-sm"><span className="truncate text-slate-700">{item.name}</span><strong className="text-slate-900">{item.value}</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.max(8, (item.value / data.services[0].value) * 100)}%` }} /></div></div>) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Aún no hay servicios informados.</p>}</div></ChartCard></div>
      <div className="mt-5 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900"><span>Conversión a ganado: <strong>{data.conversionRate === null ? "—" : `${data.conversionRate}%`}</strong></span><Link href="/dashboard/leads" className="font-bold text-indigo-700 hover:text-indigo-900">Revisar leads →</Link></div>
    </>}
  </main></DashboardShell>;
}

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_24px_rgba(15,23,42,0.03)] sm:p-6"><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p><div className="mt-5">{children}</div></section>;
}
