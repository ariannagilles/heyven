"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX = 500;

export default function IntroEditor({
  mentorId,
  initial,
}: {
  mentorId: string;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const dirty = value !== initial;

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setError("La presentazione non può essere vuota.");
      return;
    }
    if (trimmed.length > MAX) {
      setError(`Massimo ${MAX} caratteri.`);
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("mentors")
      .update({ intro_text: trimmed })
      .eq("user_id", mentorId);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setValue(trimmed);
    setSavedAt(Date.now());
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={MAX}
        rows={3}
        placeholder="Scrivi una frase di presentazione per i tuoi utenti."
        className="field min-h-[88px]"
      />
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs text-petrolio/50 tabular-nums">
          {value.length} / {MAX}
        </span>
        <div className="flex items-center gap-3">
          {savedAt && !error && (
            <span className="text-xs text-petrolio/60">salvato</span>
          )}
          <button
            type="submit"
            disabled={saving || !dirty}
            className="btn-primary"
          >
            {saving ? "Salvo…" : "Salva"}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
    </form>
  );
}
