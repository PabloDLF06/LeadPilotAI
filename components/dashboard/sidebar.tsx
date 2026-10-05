"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, Code2, LayoutDashboard, Settings2, Users, X } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { cn } from "@/lib/utils/cn";

const navigation = [{ label: "Resumen", href: "/dashboard", icon: LayoutDashboard }, { label: "Leads", href: "/dashboard/leads", icon: Users }, { label: "Automatizaciones", href: "/dashboard/automations", icon: Bot }, { label: "Analítica", href: "/dashboard/analytics", icon: BarChart3 }];
const workspace = [{ label: "Formulario y embed", href: "/dashboard/embed", icon: Code2 }, { label: "Configuración", href: "/dashboard/settings", icon: Settings2 }];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  return <><div onClick={onClose} className={cn("fixed inset-0 z-40 bg-slate-950/40 transition lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden="true" /><aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[#0b1730] px-4 py-5 text-slate-300 transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}><div className="flex items-center justify-between px-3"><BrandMark light /><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Cerrar menú"><X className="h-5 w-5" aria-hidden="true" /></button></div><div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</div><nav className="mt-3 space-y-1" aria-label="Navegación principal">{navigation.map((item) => <NavItem key={item.href} {...item} active={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))} onNavigate={onClose} />)}</nav><div className="mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Gestionar</div><nav className="mt-3 space-y-1" aria-label="Navegación de configuración">{workspace.map((item) => <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} onNavigate={onClose} />)}</nav><div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-white">Modo demo</span><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" /></div><p className="mt-2 text-xs leading-5 text-slate-400">Explora el flujo con datos simulados antes de conectar tus fuentes.</p><Link href="/dashboard/leads/new" onClick={onClose} className="mt-3 inline-flex text-xs font-bold text-indigo-300 hover:text-white">Añadir lead de prueba <span aria-hidden="true" className="ml-1">→</span></Link></div></aside></>;
}

function NavItem({ label, href, icon: Icon, active, onNavigate }: { label: string; href: string; icon: typeof LayoutDashboard; active: boolean; onNavigate: () => void }) {
  return <Link href={href} onClick={onNavigate} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors", active ? "bg-indigo-500/15 text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-white")}><Icon className={cn("h-[18px] w-[18px]", active ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300")} aria-hidden="true" /><span>{label}</span>{active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-300" /> : null}</Link>;
}
