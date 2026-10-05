import { NextResponse } from "next/server";

import { getN8nConfig } from "@/lib/integrations/n8n-env";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const config = getN8nConfig();
  const authorization = request.headers.get("authorization");
  if (!config?.internalAutomationSecret) return NextResponse.json({ error: "internal_automation_not_configured" }, { status: 503 });
  if (authorization !== `Bearer ${config.internalAutomationSecret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ active: false, items: [] });
}
