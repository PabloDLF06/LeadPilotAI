import { redirect } from "next/navigation";

export const metadata = { title: "Automatizaciones | LeadPilot AI" };

export default function AutomationsPage() {
  redirect("/dashboard/settings");
}
