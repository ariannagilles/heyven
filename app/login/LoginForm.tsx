"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

const messageClassName =
  "rounded-xl bg-[#D4EDE5] px-3 py-2 text-sm text-[#04342C]";

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
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid login credentials")) {
        setError("Email o password non corrispondono. Riprova con calma.");
      } else if (msg.includes("email not confirmed")) {
        setError("Devi ancora confermare la tua email. Controlla la posta, anche nello spam.");
      } else if (msg.includes("too many requests") || msg.includes("rate limit")) {
        setError("Troppi tentativi ravvicinati. Aspetta un momento e riprova.");
      } else {
        setError("Qualcosa non ha funzionato. Riprova tra poco.");
      }
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <div className="mx-auto w-full max-w-md">
        <img src="/logo-white.png" alt="heyven" className="mx-auto mb-8 w-24" />

        <h1 className="font-display text-center text-[25px] leading-tight text-cream">
          Il tuo rifugio ti aspettava
        </h1>
        <p className="mt-2 mb-6 text-center text-sm text-cream/70">
          Accedi per riprendere da dove eri.
        </p>

        {resetOk && (
          <p className={`${messageClassName} mb-4`}>
            Password aggiornata. Ora puoi accedere con la nuova password.
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <span className="field-label">Email</span>
            <input
              type="email"
              className="field-input mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@esempio.it"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <span className="field-label">Password</span>
            <div className="mt-2">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Almeno 8 caratteri"
                autoComplete="current-password"
                required
              />
            </div>
            <Link
              href="/reset-password/richiesta"
              className="field-hint inline-block underline underline-offset-2 hover:text-cream/70"
            >
              Password dimenticata?
            </Link>
          </div>

          {error && <p className={messageClassName}>{error}</p>}

          <button
            type="submit"
            className="w-full rounded-full bg-cream py-4 text-[15px] font-semibold text-petrolio transition active:scale-[0.99] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Accesso…" : "Entra"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-cream/55">
          Non hai un account?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="font-semibold text-cream/70 underline underline-offset-2"
          >
            Registrati
          </Link>
        </p>
      </div>
    </main>
  );
}
