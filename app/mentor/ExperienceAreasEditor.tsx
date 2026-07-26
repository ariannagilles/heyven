"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SPACES } from "@/lib/spaces";

export default function ExperienceAreasEditor({ initial }: { initial: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX = 4;

  function toggle(slug: string) {
    setSavedMsg(null);
    setError(null);
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX) {
        setError(`Puoi scegliere al massimo ${MAX} aree.`);
        return prev;
      }
      return [...prev, slug];
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("set_mentor_experience_areas", {
      areas: selected,
    });
    setSaving(false);
    if (error) {
      setError("Non è stato possibile salvare. Riprova.");
      return;
    }
    setSavedMsg("Aree aggiornate.");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SPACES.map((space) => {
          const active = selected.includes(space.slug);
          return (
            <button
              key={space.slug}
              type="button"
              onClick={() => toggle(space.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-petrolio text-crema"
                  : "bg-cream/5 text-cream hover:bg-cream/10"
              }`}
            >
              <span aria-hidden>{space.emoji}</span>
              {space.name}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm bg-[#D4EDE5] text-[#04342C] rounded-xl px-3 py-2">{error}</p>
      )}
      {savedMsg && (
        <p className="text-sm bg-[#D4EDE5] text-[#04342C] rounded-xl px-3 py-2">{savedMsg}</p>
      )}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="btn-primary text-sm"
      >
        {saving ? "Salvataggio…" : "Salva le aree"}
      </button>
    </div>
  );
}
