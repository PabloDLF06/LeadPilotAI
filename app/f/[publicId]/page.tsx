import { notFound } from "next/navigation";

import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function PublicFormPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const admin = createAdminClient();
  const { data: form } = await admin.from("forms").select("public_id, name, title, subtitle, success_title, success_message, primary_color, privacy_text, organizations(name)").eq("public_id", publicId).eq("is_active", true).maybeSingle();
  if (!form) notFound();
  const organization = Array.isArray(form.organizations) ? form.organizations[0] : form.organizations;
  return <PublicLeadForm form={{ ...form, organization_name: organization?.name || "LeadPilot AI" }} />;
}
