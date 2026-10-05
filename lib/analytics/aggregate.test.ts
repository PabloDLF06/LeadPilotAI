import { describe, expect, it } from "vitest";

import { aggregateAnalytics } from "@/lib/analytics/aggregate";

describe("aggregateAnalytics", () => {
  it("agrega KPIs, días y tiempos sin inventar métricas", () => {
    const result = aggregateAnalytics([
      { created_at: "2026-10-01T10:00:00Z", priority: "hot", status: "qualified", service_interest: "Ads", last_contacted_at: "2026-10-01T12:00:00Z" },
      { created_at: "2026-10-02T10:00:00Z", priority: "cold", status: "new", service_interest: "Web", last_contacted_at: null },
      { created_at: "2026-10-02T11:00:00Z", priority: "urgent", status: "won", service_interest: "Ads", last_contacted_at: "2026-10-02T15:00:00Z" },
    ], new Date("2026-10-01T12:00:00Z"), new Date("2026-10-02T12:00:00Z"));
    expect(result.total).toBe(3);
    expect(result.qualified).toBe(2);
    expect(result.qualificationRate).toBe(66.7);
    expect(result.conversionRate).toBe(33.3);
    expect(result.averageFirstContactHours).toBe(3);
    expect(result.daily.map((day) => day.leads)).toEqual([1, 2]);
    expect(result.services[0]).toEqual({ name: "Ads", value: 2 });
  });
});
