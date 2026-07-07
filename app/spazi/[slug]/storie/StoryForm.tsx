"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { recordActiveEngagement } from "@/lib/active-engagement";

const TITLE_MAX = 200;

export default function StoryForm({ spaceSlug }: { spaceSlug: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    const trimmedTitle = title.trim();
    if (trimmedTitle.length > TITLE_MAX) {
      setError(`Il titolo deve essere al massimo ${TITLE_MAX} caratteri.`);
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
      .from("stories")
      .insert({
        space_slug: spaceSlug,
        author_id: user.id,
        title: trimmedTitle || null,
        content: trimmedContent,
      });
    setLoading(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setTitle("");
    setContent("");
    setExpanded(false);
    recordActiveEngagement();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-3">
      {expanded && (
        <label className="block">
          <span className="text-xs font-medium text-petrolio/70">
            Dai un titolo alla tua storia (opzionale)
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            placeholder="Un titolo, se vuoi."
            className="field mt-1"
          />
        </label>
      )}
      <label className="block">
        <span className="text-xs font-medium text-petrolio/70">
          La tua storia
        </span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setExpanded(true)}
          rows={expanded ? 8 : 2}
          placeholder="Scrivi quello che vuoi raccontare…"
          className="field mt-1 min-h-[64px]"
        />
      </label>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {expanded && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setTitle("");
              setContent("");
            }}
            className="btn-ghost"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading || content.trim().length === 0}
            className="btn-primary"
          >
            {loading ? "Pubblico…" : "Pubblica la tua storia"}
          </button>
        </div>
      )}
    </form>
  );
}
