"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function StartChatButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("assign_mentor");
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("no mentors")
          ? "Nessun mentore disponibile al momento. Riprova più tardi."
          : error.message,
      );
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        onClick={start}
        disabled={loading}
        className="btn-primary w-full sm:w-auto"
      >
        {loading ? "Sto cercando un mentore…" : "Parla con il tuo Mentore"}
      </button>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}
    </div>
  );
}
