import { leadAIAnalysisSchema } from "@/lib/validations/auth";

type LeadInput = {
  fullName: string;
  email?: string;
  company?: string;
  serviceInterest?: string;
  budgetRange?: string;
  urgencyInput?: string;
  message: string;
};

export function analyzeLeadMock(input: LeadInput) {
  const text = [input.serviceInterest, input.budgetRange, input.urgencyInput, input.message].filter(Boolean).join(" ").toLowerCase();
  const urgent = /hoy|inmediato|urgente|esta semana|este mes/.test(text);
  const highBudget = /5000|5\.000|10\.000|10000|alto|premium|€/.test(text);
  const wantsQuote = /presupuesto|precio|coste|cotiza|propuesta/.test(text);
  const wantsCall = /demo|llamada|reunión|reunion|hablar/.test(text);
  const score = Math.min(98, 28 + (urgent ? 26 : 0) + (highBudget ? 24 : 0) + (wantsQuote ? 12 : 0) + (wantsCall ? 8 : 0) + (input.message.length > 120 ? 8 : 0));
  const priority = score >= 82 ? "urgent" : score >= 65 ? "hot" : score >= 45 ? "warm" : "cold";
  const intent = wantsQuote ? "request_quote" : wantsCall ? "book_call" : "information";
  const result = {
    summary: `${input.fullName}${input.company ? ` de ${input.company}` : ""} muestra interés en ${input.serviceInterest || "los servicios de la empresa"}.`,
    intent,
    service_interest: input.serviceInterest || null,
    estimated_budget: highBudget ? "high" : input.budgetRange ? "medium" : "unknown",
    urgency_level: urgent ? "high" : "medium",
    sentiment: "positive",
    pain_points: ["Necesita una respuesta rápida", input.serviceInterest ? `Busca ${input.serviceInterest.toLowerCase()}` : "Necesita más información"],
    objections: [],
    lead_score: score,
    priority,
    score_reasoning: "Puntuación demo basada determinísticamente en urgencia, presupuesto, intención y detalle del mensaje.",
    recommended_next_action: urgent ? "Contactar hoy y confirmar una primera llamada." : "Responder con contexto y proponer el siguiente paso.",
    suggested_response: {
      subject: "Gracias por contactar con nosotros",
      body: `Hola ${input.fullName},\n\nGracias por contarnos lo que necesitas. Hemos revisado tu solicitud y nos gustaría ayudarte con el siguiente paso.\n\nUn saludo,`,
    },
    confidence: 82,
    requires_human_review: priority === "urgent" || priority === "hot",
  };

  return leadAIAnalysisSchema.parse(result);
}
