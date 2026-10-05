import { describe, expect, it } from "vitest";

import { analyzeLeadMock } from "@/lib/ai/mock-analysis";
import { publicLeadSchema } from "@/lib/validations/auth";

describe("public lead flow", () => {
  it("accepts a valid public lead and rejects a filled honeypot", () => {
    const valid = publicLeadSchema.safeParse({
      formPublicId: "21000000-0000-0000-0000-000000000001",
      fullName: "Ana García",
      email: "ana@example.com",
      message: "Quiero automatizar el seguimiento de mis oportunidades.",
      honeypot: "",
    });
    const spam = publicLeadSchema.safeParse({
      formPublicId: "21000000-0000-0000-0000-000000000001",
      fullName: "Bot",
      email: "bot@example.com",
      message: "Mensaje automatizado sospechoso.",
      honeypot: "https://spam.example",
    });

    expect(valid.success).toBe(true);
    expect(spam.success).toBe(false);
  });

  it("returns a structured deterministic analysis", () => {
    const result = analyzeLeadMock({
      fullName: "Ana García",
      company: "Clínica Dental Sonrisa",
      serviceInterest: "Automatizar WhatsApp",
      urgencyInput: "Este mes",
      budgetRange: "5.000€",
      message: "Necesitamos una demo y una propuesta para empezar este mes.",
    });

    expect(result.priority).toBe("urgent");
    expect(result.lead_score).toBeGreaterThanOrEqual(82);
    expect(result.suggested_response.body).toContain("Ana García");
  });
});
