import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { analyzeLeadMock } from "@/lib/ai/mock-analysis";
import { leadAIAnalysisSchema } from "@/lib/validations/auth";

export type LeadAnalysisInput = {
  fullName: string;
  email?: string;
  company?: string;
  serviceInterest?: string;
  budgetRange?: string;
  urgencyInput?: string;
  message: string;
};

export type LeadAnalysisResult = {
  analysis: ReturnType<typeof leadAIAnalysisSchema.parse>;
  model: string;
  mode: "openai" | "demo";
  attempts: number;
};

const MAX_ATTEMPTS = 3;

function isDemoMode() {
  return !process.env.OPENAI_API_KEY || process.env.DEMO_MODE === "true";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function leadPrompt(input: LeadAnalysisInput) {
  return JSON.stringify({
    nombre: input.fullName,
    email: input.email || null,
    empresa: input.company || null,
    interes: input.serviceInterest || null,
    presupuesto: input.budgetRange || null,
    urgencia: input.urgencyInput || null,
    mensaje: input.message,
  });
}

export async function analyzeLead(input: LeadAnalysisInput): Promise<LeadAnalysisResult> {
  if (isDemoMode()) {
    return { analysis: analyzeLeadMock(input), model: "demo-mock-v1", mode: "demo", attempts: 1 };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const completion = await client.chat.completions.parse({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "Eres un analista comercial. Analiza el lead en español. Devuelve únicamente el objeto estructurado solicitado. No inventes datos: usa null o unknown cuando falte información. La respuesta sugerida debe ser profesional, breve, personalizada y no prometer condiciones que no aparecen en el lead.",
          },
          { role: "user", content: leadPrompt(input) },
        ],
        response_format: zodResponseFormat(leadAIAnalysisSchema, "lead_ai_analysis"),
      });

      const parsed = completion.choices[0]?.message.parsed;
      if (!parsed) throw new Error("structured_output_missing");
      return { analysis: leadAIAnalysisSchema.parse(parsed), model, mode: "openai", attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) await wait(250 * 2 ** (attempt - 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("lead_analysis_failed");
}
