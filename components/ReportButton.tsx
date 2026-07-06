"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReportTargetType } from "@/lib/report-types";

const PRESET_REASONS = [
  "Contenuto pericoloso o a rischio",
  "Molestie o bullismo",
  "Spam",
] as const;

const OTHER_REASON = "Altro";
const MAX_REASON = 1000;

type Props = {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
};

export default function ReportButton({ targetType, targetId, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(PRESET_REASONS[0]);
  const [otherText, setOtherText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) close();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading]);

  function close() {
    setOpen(false);
    setTimeout(() => {
      setSelected(PRESET_REASONS[0]);
      setOtherText("");
      setError(null);
      setDone(false);
    }, 300);
  }

  function buildReason(): string {
    if (selected === OTHER_REASON) {
      const trimmed = otherText.trim();
      return trimmed || OTHER_REASON;
    }
    return selected;
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const reason = buildReason();
    if (reason.length > MAX_REASON) {
      setError(`Massimo ${MAX_REASON} caratteri.`);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Accedi per segnalare un contenuto.");
      return;
    }

    const { error: insErr } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
    });

    setLoading(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }

    setDone(true);
    setTimeout(close, 1800);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Segnala contenuto"
        className={
          "inline-flex items-center justify-center w-7 h-7 rounded-full text-petrolio/35 hover:text-petrolio/70 hover:bg-petrolio/5 transition " +
          className
        }
      >
        <FlagIcon />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-petrolio/40 backdrop-blur-sm"
          onClick={() => !loading && close()}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-crema rounded-3xl p-6 max-w-md w-full shadow-soft border border-petrolio/10 relative"
          >
            <button
              type="button"
              onClick={close}
              disabled={loading}
              aria-label="Chiudi"
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-petrolio/60 hover:bg-petrolio/5"
            >
              ✕
            </button>

            {done ? (
              <div className="text-center py-4">
                <p className="text-lg font-semibold">Grazie</p>
                <p className="text-sm text-petrolio/70 mt-1">
                  Il nostro team lo revisionerà.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <header>
                  <h2 id="report-title" className="text-lg font-semibold">
                    Segnala contenuto
                  </h2>
                  <p className="text-sm text-petrolio/70 mt-1">
                    Scegli un motivo. La segnalazione è anonima per gli altri utenti.
                  </p>
                </header>

                <div
                  role="radiogroup"
                  aria-label="Motivo della segnalazione"
                  className="space-y-1.5"
                >
                  {[...PRESET_REASONS, OTHER_REASON].map((reason) => {
                    const active = selected === reason;
                    return (
                      <button
                        key={reason}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelected(reason)}
                        className={
                          "w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-left transition " +
                          (active
                            ? "bg-petrolio text-crema"
                            : "bg-petrolio/5 text-petrolio hover:bg-petrolio/10")
                        }
                      >
                        <span>{reason}</span>
                      </button>
                    );
                  })}
                </div>

                {selected === OTHER_REASON && (
                  <label className="block">
                    <span className="text-sm text-petrolio/70 mb-1.5 block">
                      Dettagli (opzionale)
                    </span>
                    <textarea
                      className="field min-h-[88px]"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      placeholder="Descrivi brevemente il problema…"
                      maxLength={MAX_REASON}
                    />
                  </label>
                )}

                {error && (
                  <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    disabled={loading}
                    className="btn-outline"
                  >
                    Annulla
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Invio…" : "Invia segnalazione"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function FlagIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}
