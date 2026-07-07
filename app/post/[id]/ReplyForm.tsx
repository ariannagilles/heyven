"use client";

import { FormEvent, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidatePathAction } from "@/lib/revalidate-path";
import { recordActiveEngagement } from "@/lib/active-engagement";

const MAX = 2000;

export default function ReplyForm({ postId }: { postId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (trimmed.length === 0) return setError("Scrivi qualcosa prima di rispondere.");
    if (trimmed.length > MAX) return setError(`Massimo ${MAX} caratteri.`);

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const { error: insErr } = await supabase
      .from("replies")
      .insert({ post_id: postId, author_id: user.id, content: trimmed });

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
    <form onSubmit={onSubmit} className="card p-5 space-y-3">
      <label className="block">
        <span className="text-xs font-medium text-petrolio/70">Rispondi in anonimo</span>
        <textarea
          className="field mt-1 min-h-[120px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Anche solo un 'ti capisco' può fare la differenza."
          maxLength={MAX}
          required
        />
        <div className="mt-1 text-right text-xs text-petrolio/50 tabular-nums">
          {content.length} / {MAX}
        </div>
      </label>

      {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Invio…" : "Pubblica risposta"}
        </button>
      </div>
    </form>
  );
}
