import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DemoLeadForm } from "@/components/dashboard/demo-lead-form";

export const metadata: Metadata = { title: "Crear lead demo | LeadPilot AI" };

export default function NewLeadPage() {
  return <DashboardShell><DemoLeadForm /></DashboardShell>;
}
