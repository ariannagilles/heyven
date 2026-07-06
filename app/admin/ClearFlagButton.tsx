"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ClearFlagButton({ mentorId }: { mentorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function clear() {
    if (!window.confirm("Rimuovere il flag da questo mentore?")) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_clear_flag", {
      p_mentor_id: mentorId,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        type="button"
        onClick={clear}
        disabled={loading}
        className="btn-outline text-sm"
      >
        {loading ? "…" : "Rimuovi flag"}
      </button>
      {error && (
        <p className="text-xs text-red-700 max-w-[180px] text-right">{error}</p>
      )}
    </div>
  );
}
