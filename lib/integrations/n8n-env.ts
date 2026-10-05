import { z } from "zod";

const rawN8nEnvSchema = z.object({
  N8N_ENABLED: z.string().optional().default("false"),
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_WEBHOOK_SECRET: z.string().min(16).optional(),
  N8N_CALLBACK_SECRET: z.string().min(16).optional(),
  N8N_TIMEOUT_MS: z.coerce.number().int().min(100).max(30_000).default(5_000),
  INTERNAL_AUTOMATION_SECRET: z.string().min(16).optional(),
});

export type N8nConfig = {
  enabled: true;
  webhookUrl: string;
  webhookSecret: string;
  callbackSecret?: string;
  timeoutMs: number;
  internalAutomationSecret?: string;
};

export function isN8nEnabled() {
  return process.env.N8N_ENABLED === "true";
}

export function getN8nConfig(): N8nConfig | null {
  if (!isN8nEnabled()) return null;
  const parsed = rawN8nEnvSchema.safeParse(process.env);
  if (!parsed.success || !parsed.data.N8N_WEBHOOK_URL || !parsed.data.N8N_WEBHOOK_SECRET) {
    return null;
  }
  return {
    enabled: true,
    webhookUrl: parsed.data.N8N_WEBHOOK_URL,
    webhookSecret: parsed.data.N8N_WEBHOOK_SECRET,
    callbackSecret: parsed.data.N8N_CALLBACK_SECRET,
    timeoutMs: parsed.data.N8N_TIMEOUT_MS,
    internalAutomationSecret: parsed.data.INTERNAL_AUTOMATION_SECRET,
  };
}

export function getN8nConfigurationState() {
  if (!isN8nEnabled()) return { enabled: false, configured: false, reason: "disabled" as const };
  const config = getN8nConfig();
  return config ? { enabled: true, configured: true, reason: "configured" as const } : { enabled: true, configured: false, reason: "missing_server_configuration" as const };
}
