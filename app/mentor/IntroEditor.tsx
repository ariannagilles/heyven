"use client";

import { FormEvent, useEffect, useState } from "react";
import MentorSectionEditButton from "@/components/mentor/MentorSectionEditButton";
import { createClient } from "@/lib/supabase/client";

const MAX = 500;

export default function IntroEditor({
  mentorId,
  initial,
  title,
  description,
}: {
  mentorId: string;
  initial: string;
  title?: string;
  description?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [savedText, setSavedText] = useState(initial);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSavedText(initial);
    if (!editing) {
      setValue(initial);
    }
  }, [initial, editing]);

  const dirty = value.trim() !== savedText.trim();

  function cancelEdit() {
    setValue(savedText);
    setError(null);
    setEditing(false);
  }

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
    const { error: updateError } = await supabase
      .from("mentors")
      .update({ intro_text: trimmed })
      .eq("user_id", mentorId);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSavedText(trimmed);
    setValue(trimmed);
    setEditing(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        {title ? (
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium text-cream/70">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs text-cream/60">{description}</p>
            ) : null}
          </div>
        ) : (
          <div className="flex-1" />
        )}
        {!editing ? <MentorSectionEditButton onClick={() => setEditing(true)} /> : null}
      </div>

      {!editing ? (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-cream/90">
          {savedText.trim() ? savedText : "Nessuna presentazione impostata."}
        </p>
      ) : (
        <form onSubmit={save} className="space-y-3">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={MAX}
            rows={3}
            placeholder="Scrivi una frase di presentazione per i tuoi utenti."
            className="field-input min-h-[88px]"
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-cream/50 tabular-nums">
              {value.length} / {MAX}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="btn-outline text-sm"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving || !dirty}
                className="btn-primary text-sm"
              >
                {saving ? "Salvo…" : "Salva"}
              </button>
            </div>
          </div>
          {error ? (
            <p className="rounded-xl bg-[#D4EDE5] px-3 py-2 text-sm text-[#04342C]">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
