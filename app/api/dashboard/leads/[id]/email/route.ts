import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentOrganizationAccess } from "@/lib/auth/organization-access";
import { createAdminClient } from "@/lib/supabase/admin";

const messageSchema = z.object({ subject: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(5000) });

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, membership } = await getCurrentOrganizationAccess();
  if (!user || !membership) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "La respuesta no es válida." }, { status: 400 });
  const { id } = await params;
  const admin = createAdminClient();
  const { data: lead } = await admin.from("leads").select("id, organization_id").eq("id", id).eq("organization_id", membership.organization_id).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });
  const now = new Date().toISOString();
  const { error } = await admin.from("lead_messages").insert({ lead_id: id, organization_id: membership.organization_id, direction: "outbound", channel: "email", subject: parsed.data.subject, body: parsed.data.body, status: "simulated", sent_by: user.id, sent_at: now, metadata: { demo: true, provider: "simulation" } });
  if (error) return NextResponse.json({ error: "No se pudo registrar el envío simulado." }, { status: 500 });
  await admin.from("leads").update({ status: "contacted", last_contacted_at: now }).eq("id", id).eq("organization_id", membership.organization_id);
  await admin.from("lead_activities").insert({ lead_id: id, organization_id: membership.organization_id, actor_user_id: user.id, type: "email_simulated", title: "Email simulado", description: "Se registró una respuesta sin enviarla a un proveedor externo.", metadata: { provider: "simulation" } });
  return NextResponse.json({ status: "simulated" }, { status: 201 });
}
