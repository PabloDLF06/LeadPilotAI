import { eachDayOfInterval, format, startOfDay } from "date-fns";

export type AnalyticsLead = {
  created_at: string;
  priority: "cold" | "warm" | "hot" | "urgent" | null;
  status: "new" | "contacted" | "qualified" | "won" | "lost" | "archived";
  service_interest: string | null;
  last_contacted_at: string | null;
};

export type AnalyticsSnapshot = {
  total: number;
  newLeads: number;
  priorityLeads: number;
  qualified: number;
  won: number;
  qualificationRate: number | null;
  conversionRate: number | null;
  averageFirstContactHours: number | null;
  daily: Array<{ date: string; label: string; leads: number }>;
  priorities: Array<{ name: string; value: number }>;
  statuses: Array<{ name: string; value: number }>;
  services: Array<{ name: string; value: number }>;
};

const priorityNames = ["cold", "warm", "hot", "urgent"] as const;
const statusNames = ["new", "contacted", "qualified", "won", "lost", "archived"] as const;

export function aggregateAnalytics(leads: AnalyticsLead[], from: Date, to: Date): AnalyticsSnapshot {
  const days = eachDayOfInterval({ start: startOfDay(from), end: startOfDay(to) });
  const dayCounts = new Map(days.map((day) => [format(day, "yyyy-MM-dd"), 0]));
  const priorityCounts = new Map(priorityNames.map((name) => [name, 0]));
  const statusCounts = new Map(statusNames.map((name) => [name, 0]));
  const serviceCounts = new Map<string, number>();
  const contactTimes: number[] = [];

  for (const lead of leads) {
    const day = format(new Date(lead.created_at), "yyyy-MM-dd");
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    if (lead.priority) priorityCounts.set(lead.priority, (priorityCounts.get(lead.priority) ?? 0) + 1);
    statusCounts.set(lead.status, (statusCounts.get(lead.status) ?? 0) + 1);
    const service = lead.service_interest?.trim();
    if (service) serviceCounts.set(service, (serviceCounts.get(service) ?? 0) + 1);
    if (lead.last_contacted_at) {
      const hours = (new Date(lead.last_contacted_at).getTime() - new Date(lead.created_at).getTime()) / 3_600_000;
      if (Number.isFinite(hours) && hours >= 0) contactTimes.push(hours);
    }
  }

  const total = leads.length;
  const qualified = (statusCounts.get("qualified") ?? 0) + (statusCounts.get("won") ?? 0);
  const won = statusCounts.get("won") ?? 0;
  return {
    total,
    newLeads: statusCounts.get("new") ?? 0,
    priorityLeads: (priorityCounts.get("hot") ?? 0) + (priorityCounts.get("urgent") ?? 0),
    qualified,
    won,
    qualificationRate: total ? Math.round((qualified / total) * 1000) / 10 : null,
    conversionRate: total ? Math.round((won / total) * 1000) / 10 : null,
    averageFirstContactHours: contactTimes.length ? Math.round((contactTimes.reduce((sum, value) => sum + value, 0) / contactTimes.length) * 10) / 10 : null,
    daily: days.map((day) => ({ date: format(day, "yyyy-MM-dd"), label: format(day, "dd MMM"), leads: dayCounts.get(format(day, "yyyy-MM-dd")) ?? 0 })),
    priorities: priorityNames.map((name) => ({ name, value: priorityCounts.get(name) ?? 0 })),
    statuses: statusNames.map((name) => ({ name, value: statusCounts.get(name) ?? 0 })),
    services: [...serviceCounts.entries()].sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value })),
  };
}
