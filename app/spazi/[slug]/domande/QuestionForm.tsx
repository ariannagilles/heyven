"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { detectAtRisk } from "@/lib/at-risk";
import { recordActiveEngagement } from "@/lib/active-engagement";

const MAX = 500;

export default function QuestionForm({ spaceSlug }: { spaceSlug: string }) {
  const router = useRouter();
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
      .from("questions")
      .insert({
        space_slug: spaceSlug,
        author_id: user.id,
        content: trimmed,
        at_risk: detectAtRisk(trimmed),
      });
    setLoading(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setContent("");
    recordActiveEngagement();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      <label className="block">
        <span className="text-xs font-medium text-cream/70">
          Hai una domanda?
        </span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX}
          rows={2}
          placeholder="Chiedi alla community."
          className="field-input mt-2 min-h-[64px]"
        />
        <div className="mt-1 text-right text-xs text-cream/50 tabular-nums">
          {content.length} / {MAX}
        </div>
      </label>
      {error && (
        <p className="msg-error">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || content.trim().length === 0}
          className="btn-primary"
        >
          {loading ? "Pubblico…" : "Pubblica"}
        </button>
      </div>
    </form>
  );
}
