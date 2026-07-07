"use client";

import { FormEvent, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidatePathAction } from "@/lib/revalidate-path";
import { recordActiveEngagement } from "@/lib/active-engagement";

const MAX = 2000;

export default function ReplyForm({ questionId }: { questionId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX) {
      setError(`Massimo ${MAX} caratteri.`);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }
    const { error: insErr } = await supabase
      .from("question_replies")
      .insert({ question_id: questionId, author_id: user.id, content: trimmed });
    setLoading(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setContent("");
    recordActiveEngagement();
    await revalidatePathAction(pathname);
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      <label className="block">
        <span className="text-xs font-medium text-petrolio/70">
          La tua risposta
        </span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX}
          rows={3}
          placeholder="Scrivi in modo gentile."
          className="field mt-1 min-h-[88px]"
        />
        <div className="mt-1 text-right text-xs text-petrolio/50 tabular-nums">
          {content.length} / {MAX}
        </div>
      </label>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || content.trim().length === 0}
          className="btn-primary"
        >
          {loading ? "Invio…" : "Rispondi"}
        </button>
      </div>
    </form>
  );
}
