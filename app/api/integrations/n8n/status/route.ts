import { NextResponse } from "next/server";

import { getCurrentOrganizationAccess } from "@/lib/auth/organization-access";
import { getN8nIntegrationStatus } from "@/lib/integrations/n8n";

export const runtime = "nodejs";

export async function GET() {
  const { user, membership, supabase } = await getCurrentOrganizationAccess();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!membership) return NextResponse.json({ error: "Workspace no encontrado." }, { status: 403 });
  return NextResponse.json(await getN8nIntegrationStatus(supabase, membership.organization_id));
}
