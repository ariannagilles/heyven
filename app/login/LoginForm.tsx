"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const resetOk = search.get("reset") === "ok";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-10 pb-20">
      <h1 className="text-2xl font-semibold mb-1">Bentornatə</h1>
      <p className="text-petrolio/70 text-sm mb-6">Accedi a heyven con la tua email.</p>

      {resetOk && (
        <p className="text-sm text-petrolio bg-crema-200/60 rounded-xl px-3 py-2 mb-4">
          Password aggiornata. Ora puoi accedere con la nuova password.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-3 card p-5">
        <label className="block">
          <span className="text-xs font-medium text-petrolio/70">Email</span>
          <input
            type="email"
            className="field mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-petrolio/70">Password</span>
          <input
            type="password"
            className="field mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Link
            href="/reset-password/richiesta"
            className="inline-block mt-1.5 text-xs text-petrolio/60 hover:text-petrolio underline underline-offset-2"
          >
            Password dimenticata?
          </Link>
        </label>

        {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Accesso…" : "Entra"}
        </button>
      </form>

      <p className="text-sm text-petrolio/70 mt-5 text-center">
        Non hai un account? <Link href={`/register?next=${encodeURIComponent(next)}`} className="underline">Registrati</Link>
      </p>
    </main>
  );
}
