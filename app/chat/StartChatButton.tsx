"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Phase = "idle" | "searching" | "found";

export default function StartChatButton() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setPhase("searching");
    setError(null);
    const supabase = createClient();

    const minWait = new Promise((res) => setTimeout(res, 2500));
    const assign = supabase.rpc("assign_mentor");

    const [, { error }] = await Promise.all([minWait, assign]);

    if (error) {
      setPhase("idle");
      setError(
        error.message.includes("no mentors")
          ? "Nessun Mentore disponibile al momento. Riprova più tardi."
          : "Qualcosa non ha funzionato. Riprova.",
      );
      return;
    }
    setPhase("found");
  }

  function goToMeeting() {
    router.push("/chat");
    router.refresh();
  }

  if (phase === "searching") {
    return (
      <div className="flex items-center gap-3 text-petrolio/80">
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-petrolio/30 border-t-petrolio"
          aria-hidden
        />
        <span className="text-sm">Stiamo trovando il Mentore più adatto a te…</span>
      </div>
    );
  }

  if (phase === "found") {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium text-petrolio">
          <span aria-hidden>✦</span> Trovato!
        </p>
        <button onClick={goToMeeting} className="btn-primary">
          Conosci il tuo Mentore
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button onClick={search} className="btn-primary">
        Trova il mio Mentore
      </button>
      {error && (
        <p className="rounded-xl bg-[#D4EDE5] px-3 py-2 text-sm text-[#04342C]">{error}</p>
      )}
    </div>
  );
}
