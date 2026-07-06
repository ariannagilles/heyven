"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetRequestForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/reset-password/conferma`;
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (resetErr) {
      setError(resetErr.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-10 pb-20">
      <Link
        href="/login"
        className="text-sm text-petrolio/60 hover:text-petrolio"
      >
        ← torna al login
      </Link>

      <h1 className="text-2xl font-semibold mb-1 mt-4">Recupera password</h1>
      <p className="text-petrolio/70 text-sm mb-6">
        Inserisci l&apos;email del tuo account. Ti invieremo un link per
        reimpostare la password.
      </p>

      {sent ? (
        <div className="card p-5 space-y-3">
          <p className="text-petrolio leading-relaxed">
            Se l&apos;indirizzo esiste, riceverai un&apos;email con le istruzioni.
          </p>
          <Link href="/login" className="btn-outline w-full inline-flex">
            Torna al login
          </Link>
        </div>
      ) : (
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

          {error && (
            <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Invio…" : "Invia link di recupero"}
          </button>
        </form>
      )}
    </main>
  );
}
