import { createClient } from "@/lib/supabase/server";

export type OrganizationRole = "owner" | "admin" | "member";

export async function getCurrentOrganizationAccess(allowedRoles?: OrganizationRole[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, membership: null };

  let query = supabase.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1);
  if (allowedRoles?.length) query = query.in("role", allowedRoles);
  const { data: membership } = await query.maybeSingle();
  return { supabase, user, membership: membership as { organization_id: string; role: OrganizationRole } | null };
}
