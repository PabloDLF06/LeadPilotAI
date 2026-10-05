import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido."),
  password: z.string().min(1, "Introduce tu contraseña."),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Introduce tu nombre completo."),
  email: z.string().email("Introduce un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const publicLeadSchema = z.object({
  formPublicId: z.string().uuid("Formulario inválido."),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().max(30).optional().or(z.literal("")),
  company: z.string().max(150).optional().or(z.literal("")),
  website: z.string().max(200).optional().or(z.literal("")),
  serviceInterest: z.string().max(150).optional().or(z.literal("")),
  budgetRange: z.string().max(100).optional().or(z.literal("")),
  urgencyInput: z.string().max(100).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  consent: z.boolean().optional(),
  honeypot: z.string().max(0).default(""),
  submittedAt: z.number().optional(),
});

export const leadAIAnalysisSchema = z.object({
  summary: z.string(),
  intent: z.enum(["request_quote", "book_call", "information", "support", "complaint", "other"]),
  service_interest: z.string().nullable(),
  estimated_budget: z.enum(["low", "medium", "high", "unknown"]),
  urgency_level: z.enum(["low", "medium", "high", "critical"]),
  sentiment: z.enum(["positive", "neutral", "negative", "mixed"]),
  pain_points: z.array(z.string()).max(5),
  objections: z.array(z.string()).max(5),
  lead_score: z.number().int().min(0).max(100),
  priority: z.enum(["cold", "warm", "hot", "urgent"]),
  score_reasoning: z.string(),
  recommended_next_action: z.string(),
  suggested_response: z.object({ subject: z.string().max(180), body: z.string().max(4000) }),
  confidence: z.number().int().min(0).max(100),
  requires_human_review: z.boolean(),
});
