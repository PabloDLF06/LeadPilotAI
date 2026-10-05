import { afterEach, describe, expect, it } from "vitest";

import { getSupabaseAdminKey, getSupabaseAnonKey } from "@/lib/supabase/env";

const original = {
  secret: process.env.SUPABASE_SECRET_KEY,
  service: process.env.SUPABASE_SERVICE_ROLE_KEY,
  publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

afterEach(() => {
  process.env.SUPABASE_SECRET_KEY = original.secret;
  process.env.SUPABASE_SERVICE_ROLE_KEY = original.service;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = original.publishable;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = original.anon;
});

describe("Supabase key selection", () => {
  it("prefiere secret/publishable modernas y conserva fallback legacy", () => {
    process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "legacy_service_role_test";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "legacy_anon_test";
    expect(getSupabaseAdminKey()).toBe("sb_secret_test");
    expect(getSupabaseAnonKey()).toBe("sb_publishable_test");
  });
});
