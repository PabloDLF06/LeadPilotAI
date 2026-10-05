import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ status: "ok", demoMode: process.env.DEMO_MODE === "true", n8nEnabled: process.env.N8N_ENABLED === "true", timestamp: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
