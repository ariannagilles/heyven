"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SpaceSelector from "@/components/SpaceSelector";

const MAX = 500;

export default function NewQuestionForm({ initialSpace }: { initialSpace: string }) {
  const router = useRouter();
  const [space, setSpace] = useState(initialSpace);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (!space) return setError("Scegli uno spazio tematico.");
    if (trimmed.length === 0) return setError("Scrivi la tua domanda.");
    if (trimmed.length > MAX) return setError(`Massimo ${MAX} caratteri.`);

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const { data, error: insErr } = await supabase
      .from("questions")
      .insert({ author_id: user.id, space_slug: space, content: trimmed })
      .select("id")
      .single();

    setLoading(false);

    if (insErr || !data) {
      setError(insErr?.message ?? "Qualcosa non ha funzionato. Riprova.");
      return;
    }
    router.replace(`/spazi/${space}/domande/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      <SpaceSelector value={space} onChange={setSpace} />

      <label className="block">
        <span className="text-xs font-medium text-petrolio/70">La tua domanda</span>
        <textarea
          className="field mt-1 min-h-[120px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Scrivi la tua domanda..."
          maxLength={MAX}
          required
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
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Pubblico…" : "Pubblica la domanda"}
        </button>
      </div>
    </form>
  );
}
