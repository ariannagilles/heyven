"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MarkReportReviewedButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markReviewed() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_mark_report_reviewed", {
      p_report_id: reportId,
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
        onClick={markReviewed}
        disabled={loading}
        className="btn-outline text-sm"
      >
        {loading ? "…" : "Segna come revisionato"}
      </button>
      {error && (
        <p className="text-xs text-red-700 max-w-[200px] text-right">{error}</p>
      )}
    </div>
  );
}
