"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitConversationRating } from "@/lib/mentor-rating-rpc";

type Props = {
  open: boolean;
  conversationId: string;
  mentorNickname: string;
  onDone: () => void;
};

export default function MentorConversationRatingSheet({
  open,
  conversationId,
  mentorNickname,
  onDone,
}: Props) {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function finish() {
    onDone();
    router.refresh();
  }

  async function submitRating() {
    if (stars < 1) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: submitError } = await submitConversationRating(
      supabase,
      conversationId,
      stars,
    );
    setLoading(false);
    if (submitError) {
      setError(submitError.message);
      return;
    }
    finish();
  }

  const active = hover || stars;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-petrolio/40 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-conversation-title"
        className="glass-card w-full max-w-md rounded-t-[28px] rounded-b-[24px] p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <h2
          id="rate-conversation-title"
          className="font-display text-[20px] leading-snug text-cream"
        >
          Com&apos;è stato parlare con {mentorNickname}?
        </h2>
        <div
          className="mt-5 flex justify-center gap-2"
          role="radiogroup"
          aria-label="Valutazione da 1 a 5 stelle"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} stelle`}
              disabled={loading}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(n)}
              className="p-1 text-[32px] leading-none transition-transform active:scale-95 disabled:opacity-50"
            >
              <span className={active >= n ? "text-mint" : "text-cream/18"}>
                ★
              </span>
            </button>
          ))}
        </div>
        {error && (
          <p className="mt-3 rounded-xl bg-[#D4EDE5] px-3 py-2 text-center text-sm text-[#04342C]">
            {error}
          </p>
        )}
        <div className="mt-6 space-y-3">
          {stars >= 1 && (
            <button
              type="button"
              onClick={() => void submitRating()}
              disabled={loading}
              className="w-full rounded-full bg-cream py-3.5 text-[15px] font-semibold text-petrolio transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Invio…" : "Invia valutazione"}
            </button>
          )}
          <button
            type="button"
            onClick={finish}
            disabled={loading}
            className="w-full py-2 text-[15px] text-cream/55 transition-colors hover:text-cream/75 disabled:opacity-50"
          >
            Salta
          </button>
        </div>
      </div>
    </div>
  );
}
