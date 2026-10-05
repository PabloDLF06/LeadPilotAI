"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
    });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(body.error ?? "No se pudo iniciar sesión.");
      return;
    }
    const nextPath = new URLSearchParams(window.location.search).get("next");
    router.replace(nextPath || "/dashboard");
    router.refresh();
  }

  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold text-indigo-600">LeadPilot AI</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-slate-600">Accede a tu espacio de trabajo.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Contraseña
          <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
        <button disabled={loading} className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        ¿No tienes cuenta? <Link className="font-semibold text-indigo-600" href="/register">Regístrate</Link>
      </p>
    </section>
  );
}
