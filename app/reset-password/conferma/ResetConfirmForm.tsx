"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetConfirmForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      const supabase = createClient();
      const code = search.get("code");

      if (code) {
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exchangeErr) {
          setSessionError(
            "Link non valido o scaduto. Richiedi un nuovo link di recupero.",
          );
          return;
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!user) {
        setSessionError(
          "Link non valido o scaduto. Richiedi un nuovo link di recupero.",
        );
        return;
      }

      setReady(true);
    }

    void initSession();
    return () => {
      cancelled = true;
    };
  }, [search]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (password !== confirm) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?reset=ok");
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-10 pb-20">
      <Link
        href="/login"
        className="text-sm text-petrolio/60 hover:text-petrolio"
      >
        ← torna al login
      </Link>

      <h1 className="text-2xl font-semibold mb-1 mt-4">Nuova password</h1>
      <p className="text-petrolio/70 text-sm mb-6">
        Scegli una nuova password per il tuo account.
      </p>

      {sessionError ? (
        <div className="card p-5 space-y-3">
          <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
            {sessionError}
          </p>
          <Link
            href="/reset-password/richiesta"
            className="btn-primary w-full inline-flex"
          >
            Richiedi un nuovo link
          </Link>
        </div>
      ) : !ready ? (
        <div className="card p-5 text-sm text-petrolio/70 text-center">
          Verifica del link in corso…
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 card p-5">
          <label className="block">
            <span className="text-xs font-medium text-petrolio/70">
              Nuova password
            </span>
            <input
              type="password"
              className="field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-petrolio/70">
              Conferma nuova password
            </span>
            <input
              type="password"
              className="field mt-1"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Salvo…" : "Imposta nuova password"}
          </button>
        </form>
      )}
    </main>
  );
}
