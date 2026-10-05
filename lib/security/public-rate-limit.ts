import { createHash } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";

export function getClientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

export function hashClientIp(ip: string) {
  const salt = process.env.RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "leadpilot-demo-rate-limit";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function assertPublicRateLimit(ipHash: string) {
  const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 5);
  const windowSeconds = Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60);
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("api_events")
    .select("id", { count: "exact", head: true })
    .eq("event_type", "public_lead_attempt")
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (error) throw new Error("rate_limit_lookup_failed");
  if ((count ?? 0) >= maxRequests) throw new Error("rate_limit_exceeded");
}
