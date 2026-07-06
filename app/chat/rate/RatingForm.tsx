"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX = 1000;

export default function RatingForm({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function skip() {
    router.replace("/");
    router.refresh();
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("Scegli da 1 a 5 stelle.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("submit_rating", {
      p_conversation_id: conversationId,
      p_rating: rating,
      p_feedback: feedback.trim() || null,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card p-5 space-y-4">
      <div>
        <span className="text-xs font-medium text-petrolio/70 block mb-2">
          La tua valutazione
        </span>
        <div
          className="flex items-center gap-1.5"
          role="radiogroup"
          aria-label="valutazione"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (hover || rating) >= n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} stelle`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="p-1 text-3xl leading-none transition"
              >
                <span className={active ? "text-petrolio" : "text-petrolio/20"}>
                  ★
                </span>
              </button>
            );
          })}
          <span className="ml-2 text-sm text-petrolio/60 tabular-nums">
            {rating > 0 ? `${rating}/5` : ""}
          </span>
        </div>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-petrolio/70">
          Vuoi raccontarci com'è andata? (opzionale)
        </span>
        <textarea
          className="field mt-1 min-h-[120px]"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="La tua esperienza, in libertà."
          maxLength={MAX}
        />
        <div className="mt-1 text-right text-xs text-petrolio/50 tabular-nums">
          {feedback.length} / {MAX}
        </div>
      </label>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={skip}
          disabled={loading}
          className="btn-ghost"
        >
          Salta
        </button>
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="btn-primary"
        >
          {loading ? "Invio…" : "Invia"}
        </button>
      </div>
    </form>
  );
}
