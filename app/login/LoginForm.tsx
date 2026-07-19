"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClassName =
  "mt-1 w-full rounded-2xl border border-[#04342C]/15 bg-white/60 px-4 py-3 text-[#04342C] outline-none focus:border-[#0F6E56]";

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
      setError(error.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-[#FAEEDA] px-6">
      <div className="mx-auto w-full max-w-md">
        <img
          src="/logo-green.png"
          alt="heyven"
          className="mx-auto mb-8 w-24"
        />

        <h1 className="text-center text-2xl font-semibold text-[#04342C]">
          Il tuo rifugio ti aspettava
        </h1>
        <p className="mt-2 mb-6 text-center text-sm text-[#4A6158]">
          Accedi per riprendere da dove eri.
        </p>

        {resetOk && (
          <p className={`${messageClassName} mb-4`}>
            Password aggiornata. Ora puoi accedere con la nuova password.
          </p>
        )}

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-white/60 bg-white/50 p-5"
        >
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-[#4A6158]">Email</span>
              <input
                type="email"
                className={inputClassName}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#4A6158]">Password</span>
              <input
                type="password"
                className={inputClassName}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Link
                href="/reset-password/richiesta"
                className="mt-1.5 inline-block text-xs text-[#4A6158] underline underline-offset-2 hover:text-[#04342C]"
              >
                Password dimenticata?
              </Link>
            </label>

            {error && <p className={messageClassName}>{error}</p>}

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-[#04342C] py-4 font-semibold text-[#FAEEDA] transition active:scale-[0.99] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Accesso…" : "Entra"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[#4A6158]">
          Non hai un account?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[#04342C] underline"
          >
            Registrati
          </Link>
        </p>
      </div>
    </main>
  );
}
