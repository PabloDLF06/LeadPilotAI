import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminKey, getSupabaseUrl } from "./env";

export function createAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseAdminKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
