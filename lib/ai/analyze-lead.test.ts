import { afterEach, describe, expect, it } from "vitest";

import { analyzeLead } from "@/lib/ai/analyze-lead";

const originalDemoMode = process.env.DEMO_MODE;
const originalApiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  process.env.DEMO_MODE = originalDemoMode;
  process.env.OPENAI_API_KEY = originalApiKey;
});

describe("analyzeLead", () => {
  it("uses the demo analyzer without an API key and returns structured data", async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.DEMO_MODE = "false";

    const result = await analyzeLead({
      fullName: "Ana García",
      email: "ana@example.com",
      serviceInterest: "Automatización",
      budgetRange: "5.000€",
      urgencyInput: "Este mes",
      message: "Necesitamos una propuesta y una demo para empezar este mes.",
    });

    expect(result.mode).toBe("demo");
    expect(result.analysis.suggested_response.body).toContain("Ana García");
    expect(result.analysis.lead_score).toBeGreaterThan(0);
  });
});
