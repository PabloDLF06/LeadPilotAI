import { afterEach, describe, expect, it } from "vitest";

import { generateN8nSignature, isN8nEnabled, isN8nTimestampFresh, makeN8nIdempotencyKey, verifyN8nCallbackSignature } from "@/lib/integrations/n8n";

const original = { enabled: process.env.N8N_ENABLED, webhook: process.env.N8N_WEBHOOK_SECRET, callback: process.env.N8N_CALLBACK_SECRET, url: process.env.N8N_WEBHOOK_URL, internal: process.env.INTERNAL_AUTOMATION_SECRET };

afterEach(() => {
  process.env.N8N_ENABLED = original.enabled;
  process.env.N8N_WEBHOOK_SECRET = original.webhook;
  process.env.N8N_CALLBACK_SECRET = original.callback;
  process.env.N8N_WEBHOOK_URL = original.url;
  process.env.INTERNAL_AUTOMATION_SECRET = original.internal;
});

describe("n8n integration primitives", () => {
  it("is disabled unless N8N_ENABLED is exactly true", () => {
    process.env.N8N_ENABLED = "1";
    expect(isN8nEnabled()).toBe(false);
  });

  it("generates and verifies HMAC using timestamp.rawBody", () => {
    process.env.N8N_ENABLED = "true";
    process.env.N8N_WEBHOOK_URL = "https://n8n.example.com/webhook";
    process.env.N8N_WEBHOOK_SECRET = "webhook-secret-long-enough";
    process.env.N8N_CALLBACK_SECRET = "webhook-secret-long-enough";
    process.env.INTERNAL_AUTOMATION_SECRET = "internal-secret-long-enough";
    const timestamp = "1700000000";
    const body = '{"event":"test"}';
    const signature = generateN8nSignature(timestamp, body);
    expect(signature).toHaveLength(64);
    expect(verifyN8nCallbackSignature(timestamp, body, signature)).toBe(true);
    expect(verifyN8nCallbackSignature(timestamp, body + "x", signature)).toBe(false);
  });

  it("rejects stale callback timestamps and keeps idempotency stable", () => {
    const now = 1_700_000_000_000;
    expect(isN8nTimestampFresh("1700000000", now)).toBe(true);
    expect(isN8nTimestampFresh("1699999000", now)).toBe(false);
    const key = makeN8nIdempotencyKey({ leadId: "lead-1", eventName: "lead.priority_detected", score: 70, priority: "hot" });
    expect(key).toBe("lead:lead-1:event:lead.priority_detected:score:70:priority:hot");
  });
});
