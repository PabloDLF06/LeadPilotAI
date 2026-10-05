import { NextResponse } from "next/server";

import { bootstrapOrganization } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "No se pudo crear la cuenta." }, { status: 400 });
  }

  try {
    await bootstrapOrganization(data.user.id, parsed.data.fullName);
  } catch {
    return NextResponse.json(
      { error: "La cuenta se creó, pero no se pudo preparar el espacio de trabajo. Inicia sesión para reintentarlo." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true, requiresEmailConfirmation: !data.session },
    { status: 201 },
  );
}
