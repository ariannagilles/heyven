"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { randomNickname } from "@/lib/nickname";

type NicknameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const NICKNAME_TAKEN_HINT = "Questo nickname è già in uso, provane un altro";
const NICKNAME_RACE_ERROR =
  "Questo nickname è già stato preso da qualcun altro, provane uno diverso";

function isValidNickname(nick: string): boolean {
  return (
    nick.length >= 2 &&
    nick.length <= 24 &&
    /^[a-zA-Z0-9._-]+$/.test(nick)
  );
}

function isDatabaseNicknameError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("duplicate key") ||
    m.includes("unique constraint") ||
    m.includes("profiles_nickname") ||
    m.includes("database error saving new user") ||
    (m.includes("nickname") &&
      (m.includes("duplicate") || m.includes("unique") || m.includes("already")))
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nick = nickname.trim();

    if (!nick) {
      setNicknameStatus("idle");
      return;
    }

    if (!isValidNickname(nick)) {
      setNicknameStatus("invalid");
      return;
    }

    setNicknameStatus("checking");
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("nickname_available", {
        p_nickname: nick,
      });

      if (rpcError) {
        setNicknameStatus("idle");
        return;
      }

      setNicknameStatus(data === true ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname]);

  const submitDisabled =
    loading ||
    nicknameStatus === "checking" ||
    nicknameStatus === "taken" ||
    nicknameStatus === "invalid";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const nick = nickname.trim();
    if (!isValidNickname(nick)) {
      setError("Il nickname deve avere tra 2 e 24 caratteri e usare solo lettere, numeri, . _ -");
      return;
    }
    if (nicknameStatus === "taken") {
      setError(NICKNAME_TAKEN_HINT);
      return;
    }
    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname: nick } },
    });
    setLoading(false);

    if (signUpError) {
      if (isDatabaseNicknameError(signUpError.message)) {
        setError(NICKNAME_RACE_ERROR);
        setNicknameStatus("taken");
      } else {
        setError(signUpError.message);
      }
      return;
    }
    if (data.session) {
      router.replace(next);
      router.refresh();
    } else {
      setInfo("Ti abbiamo inviato una mail di conferma. Apri il link, poi torna qui e fai login.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-10 pb-20">
      <h1 className="text-2xl font-semibold mb-1">Unisciti a heyven</h1>
      <p className="text-petrolio/70 text-sm mb-6">
        Scegli un nickname anonimo. Sarà l'unico nome visibile nella community.
      </p>

      <form onSubmit={onSubmit} className="space-y-3 card p-5">
        <label className="block">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-petrolio/70">
              Nickname anonimo
            </span>
            <button
              type="button"
              onClick={() => {
                setNickname(randomNickname());
                setError(null);
              }}
              className="text-xs font-medium text-petrolio/70 hover:text-petrolio underline underline-offset-2"
            >
              ✦ Genera per me
            </button>
          </div>
          <input
            className="field mt-1"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="es. luna_silente"
            autoComplete="off"
            required
          />
          {nicknameStatus === "taken" && (
            <p className="mt-1.5 text-xs text-petrolio/60">{NICKNAME_TAKEN_HINT}</p>
          )}
          {nicknameStatus === "checking" && nickname.trim().length > 0 && isValidNickname(nickname.trim()) && (
            <p className="mt-1.5 text-xs text-petrolio/50">Verifica disponibilità…</p>
          )}
        </label>
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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        {info && <p className="text-sm text-petrolio bg-crema-200/60 rounded-xl px-3 py-2">{info}</p>}

        <button type="submit" className="btn-primary w-full" disabled={submitDisabled}>
          {loading ? "Creazione…" : "Crea il mio spazio"}
        </button>
      </form>

      <p className="text-sm text-petrolio/70 mt-5 text-center">
        Hai già un account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline">Accedi</Link>
      </p>
    </main>
  );
}
