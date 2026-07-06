"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX = 2000;

type FeedbackType = "bug" | "idea" | "message";

const TYPES: { value: FeedbackType; emoji: string; label: string }[] = [
  { value: "bug",     emoji: "🐛", label: "Ho trovato un problema" },
  { value: "idea",    emoji: "💡", label: "Ho un'idea" },
  { value: "message", emoji: "❤️", label: "Voglio dire una cosa" },
];

export default function FeedbackWidget() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("message");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Hide on auth pages
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth");

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
      setContent("");
      setType("message");
      setError(null);
      setDone(false);
    }, 300);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Scrivi qualcosa prima di inviare.");
      return;
    }
    if (trimmed.length > MAX) {
      setError(`Massimo ${MAX} caratteri.`);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insErr } = await supabase.from("feedbacks").insert({
      user_id: user?.id ?? null,
      type,
      content: trimmed,
      current_page: pathname || null,
    });
    setLoading(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setDone(true);
    setTimeout(close, 1500);
  }

  if (isAuthPage) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Invia feedback"
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-petrolio text-crema px-4 py-2.5 text-sm font-medium shadow-soft hover:bg-petrolio-600 active:scale-[0.97] transition"
      >
        <ChatIcon />
        <span>Feedback</span>
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
            aria-labelledby="feedback-title"
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
                <p className="text-lg font-semibold">Grazie 💛</p>
                <p className="text-sm text-petrolio/70 mt-1">
                  Il tuo feedback è arrivato.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <header>
                  <h2 id="feedback-title" className="text-lg font-semibold">
                    Cosa pensi di Heyven?
                  </h2>
                  <p className="text-sm text-petrolio/70 mt-1">
                    Ogni feedback ci aiuta a migliorare.
                  </p>
                </header>

                <div
                  role="radiogroup"
                  aria-label="Tipo di feedback"
                  className="space-y-1.5"
                >
                  {TYPES.map((t) => {
                    const active = t.value === type;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setType(t.value)}
                        className={
                          "w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-left transition " +
                          (active
                            ? "bg-petrolio text-crema"
                            : "bg-petrolio/5 text-petrolio hover:bg-petrolio/10")
                        }
                      >
                        <span className="text-lg" aria-hidden>
                          {t.emoji}
                        </span>
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                <label className="block">
                  <span className="sr-only">Il tuo messaggio</span>
                  <textarea
                    className="field min-h-[120px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Scrivi quello che pensi, tutto è utile."
                    maxLength={MAX}
                    required
                  />
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
                    {loading ? "Invio…" : "Invia"}
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

function ChatIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
