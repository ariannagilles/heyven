"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ActivateMentorButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function activate() {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const minWait = new Promise((res) => setTimeout(res, 2500));
    const assign = supabase.rpc("assign_mentor");
    const [, { error: assignError }] = await Promise.all([minWait, assign]);

    if (assignError) {
      setLoading(false);
      setError(
        assignError.message.includes("no mentors")
          ? "Nessun Mentore disponibile al momento. Riprova più tardi."
          : "Qualcosa non ha funzionato. Riprova.",
      );
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={activate}
        disabled={loading}
        className="w-full rounded-full bg-cream py-3.5 text-[15px] font-semibold text-petrolio transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Stiamo trovando il Mentore più adatto…" : "Attiva il tuo Mentore"}
      </button>
      {error && <p className="msg-error text-center">{error}</p>}
    </div>
  );
}
