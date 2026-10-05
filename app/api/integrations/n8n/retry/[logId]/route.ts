import { NextResponse } from "next/server";

import { getCurrentOrganizationAccess } from "@/lib/auth/organization-access";
import { retryN8nEvent } from "@/lib/integrations/n8n";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ logId: string }> }) {
  const { logId } = await params;
  const { user, membership } = await getCurrentOrganizationAccess(["owner", "admin"]);
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!membership) return NextResponse.json({ error: "Se requiere rol owner o admin." }, { status: 403 });

  const admin = createAdminClient();
  const { data: log } = await admin.from("automation_logs").select("id, status").eq("id", logId).eq("organization_id", membership.organization_id).maybeSingle();
  if (!log) return NextResponse.json({ error: "Log no encontrado." }, { status: 404 });
  if (log.status !== "failed") return NextResponse.json({ error: "Solo se pueden reintentar eventos fallidos." }, { status: 409 });
  const result = await retryN8nEvent(admin, logId);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
