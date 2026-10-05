import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";

export type WorkspaceBootstrapErrorCode = "admin_key_missing" | "admin_key_invalid" | "table_permission_denied" | "rls_denied" | "trigger_error" | "workspace_exists" | "unknown";

export function organizationSlug(userId: string) {
  return `leadpilot-${userId.replaceAll("-", "").slice(0, 16)}`;
}

export function classifyWorkspaceError(error: unknown): WorkspaceBootstrapErrorCode {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  if (message.includes("missing supabase") || message.includes("missing_supabase")) return "admin_key_missing";
  if (message.includes("invalid supabase server admin key")) return "admin_key_invalid";
  if (message.includes("permission denied for table") || message.includes("grant")) return "table_permission_denied";
  if (message.includes("row-level security") || message.includes("rls")) return "rls_denied";
  if (message.includes("trigger") || message.includes("function")) return "trigger_error";
  if (message.includes("duplicate") || message.includes("already exists")) return "workspace_exists";
  return "unknown";
}

function logWorkspaceError(code: WorkspaceBootstrapErrorCode, userId: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const safeMessage = message.replaceAll(/(sb_(publishable|secret)_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9._-]+)/g, "[redacted]").slice(0, 240);
  console.error("[workspace-bootstrap]", { code, user_id: userId, message: safeMessage });
}

async function findMembership(admin: SupabaseClient, userId: string) {
  return admin.from("organization_members").select("organization_id, role, organizations(id, name)").eq("user_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle();
}

async function ensureInitialForm(admin: SupabaseClient, organizationId: string) {
  const { data: form, error: readError } = await admin.from("forms").select("id").eq("organization_id", organizationId).order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (readError) throw readError;
  if (form) return form;
  const { data: created, error } = await admin.from("forms").insert({ organization_id: organizationId, name: "Formulario web principal" }).select("id").single();
  if (error || !created) throw error ?? new Error("initial_form_not_created");
  return created;
}

export async function bootstrapOrganization(userId: string, fullName: string) {
  if (!userId) throw new Error("authenticated_user_required");
  const organizationName = fullName.trim() ? `${fullName.trim()} Workspace` : "Mi organización";
  const slug = organizationSlug(userId);

  try {
    const admin = createAdminClient();
    const existingMembership = await findMembership(admin, userId);
    if (existingMembership.error) throw existingMembership.error;
    if (existingMembership.data?.organization_id) {
      const form = await ensureInitialForm(admin, existingMembership.data.organization_id);
      const organization = Array.isArray(existingMembership.data.organizations) ? existingMembership.data.organizations[0] : existingMembership.data.organizations;
      return { id: existingMembership.data.organization_id, name: organization?.name || organizationName, formId: form.id, recovered: true };
    }

    const existingOrganization = await admin.from("organizations").select("id, name").eq("slug", slug).maybeSingle();
    if (existingOrganization.error) throw existingOrganization.error;
    let organization = existingOrganization.data;
    if (!organization) {
      const created = await admin.from("organizations").insert({ name: organizationName, slug }).select("id, name").single();
      if (created.error || !created.data) throw created.error ?? new Error("organization_not_created");
      organization = created.data;
    }

    const membership = await admin.from("organization_members").upsert({ organization_id: organization.id, user_id: userId, role: "owner" }, { onConflict: "organization_id,user_id", ignoreDuplicates: true });
    if (membership.error) throw membership.error;
    const form = await ensureInitialForm(admin, organization.id);
    return { id: organization.id, name: organization.name, formId: form.id, recovered: Boolean(existingOrganization.data) };
  } catch (error) {
    const code = classifyWorkspaceError(error);
    logWorkspaceError(code, userId, error);
    throw new Error(`workspace_bootstrap_failed:${code}`);
  }
}
