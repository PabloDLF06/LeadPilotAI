export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return value;
}

export function getSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error("Missing Supabase publishable key");
  }
  return value;
}

export function getSupabaseAdminKey(): string {
  const value = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error("Missing Supabase server admin key");
  }
  if (value.startsWith("sb_publishable_") || value.startsWith("sb_anon_")) {
    throw new Error("Invalid Supabase server admin key: publishable key supplied");
  }
  return value;
}

export function getSupabaseServiceRoleKey(): string {
  return getSupabaseAdminKey();
}
