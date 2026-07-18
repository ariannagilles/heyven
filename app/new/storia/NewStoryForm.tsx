"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { detectAtRisk } from "@/lib/at-risk";
import { recordActiveEngagement } from "@/lib/active-engagement";
import SpaceSelector from "@/components/SpaceSelector";

const TITLE_MAX = 200;

export default function NewStoryForm({ initialSpace }: { initialSpace: string }) {
  const router = useRouter();
  const [space, setSpace] = useState(initialSpace);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedContent = content.trim();
    const trimmedTitle = title.trim();
    if (!space) return setError("Scegli uno spazio tematico.");
    if (trimmedContent.length === 0) return setError("Scrivi la tua storia.");
    if (trimmedTitle.length > TITLE_MAX) {
      return setError(`Il titolo deve essere al massimo ${TITLE_MAX} caratteri.`);
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const { error: insErr } = await supabase.from("stories").insert({
      author_id: user.id,
      space_slug: space,
      title: trimmedTitle || null,
      content: trimmedContent,
      at_risk: detectAtRisk(trimmedTitle, trimmedContent),
    });

    setLoading(false);

    if (insErr) {
      setError(insErr.message);
      return;
    }
    recordActiveEngagement();
    router.replace(`/spazi/${space}/storie`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      <SpaceSelector value={space} onChange={setSpace} />

      <label className="block">
        <span className="text-xs font-medium text-petrolio/70">Titolo</span>
        <input
          className="field mt-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Dai un titolo alla tua storia (opzionale)"
          maxLength={TITLE_MAX}
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-petrolio/70">La tua storia</span>
        <textarea
          className="field mt-1 min-h-[260px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Scrivi quello che vuoi raccontare..."
          required
        />
      </label>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Pubblico…" : "Pubblica la tua storia"}
        </button>
      </div>
    </form>
  );
}
