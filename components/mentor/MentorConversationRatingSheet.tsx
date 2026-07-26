"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  submitConversationRating,
  submitConversationRatingFeedback,
} from "@/lib/mentor-rating-rpc";
import {
  logMentorRatingError,
  MENTOR_RATING_FEEDBACK_ERROR,
  MENTOR_RATING_STARS_ERROR,
} from "@/lib/mentor-rating-errors";

type Props = {
  open: boolean;
  conversationId: string;
  mentorNickname: string;
  /** Chiamato subito dopo il salvataggio delle stelle (voto registrato). */
  onStarsSubmitted?: () => void;
  /** Chiamato quando lo sheet si chiude del tutto. */
  onFinished?: () => void;
  /** Salta senza votare (solo passo 1). */
  onSkipped?: () => void;
  /** @deprecated use onStarsSubmitted + onFinished */
  onSubmitted?: () => void;
  /** @deprecated use onFinished */
  onDone?: () => void;
};

type ErrorPhase = "stars" | "feedback" | null;

function RatingNotice({ children }: { children: string }) {
  return (
    <p
      role="status"
      className="mt-3 text-center text-[14px] leading-[1.45] text-[#04342C]"
    >
      <span className="inline-block rounded-lg bg-[#D4EDE5] px-3 py-2">
        {children}
      </span>
    </p>
  );
}

export default function MentorConversationRatingSheet({
  open,
  conversationId,
  mentorNickname,
  onStarsSubmitted,
  onFinished,
  onSkipped,
  onSubmitted,
  onDone,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"stars" | "feedback">("stars");
  const [stars, setStars] = useState(0);
  const [savedStars, setSavedStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorPhase, setErrorPhase] = useState<ErrorPhase>(null);

  useEffect(() => {
    if (!open) {
      setPhase("stars");
      setStars(0);
      setSavedStars(0);
      setHover(0);
      setFeedback("");
      setErrorPhase(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  function finish() {
    onFinished?.();
    onDone?.();
    router.refresh();
  }

  function skipStars() {
    onSkipped?.();
    finish();
  }

  async function submitStars() {
    if (stars < 1) return;
    setLoading(true);
    setErrorPhase(null);
    try {
      const supabase = createClient();
      const { error: submitError } = await submitConversationRating(
        supabase,
        conversationId,
        stars,
      );
      if (submitError) {
        logMentorRatingError("stars", submitError);
        setErrorPhase("stars");
        return;
      }
      setSavedStars(stars);
      setPhase("feedback");
      onStarsSubmitted?.();
    } catch (err) {
      logMentorRatingError("stars", err);
      setErrorPhase("stars");
    } finally {
      setLoading(false);
    }
  }

  async function submitFeedbackAndClose() {
    const trimmed = feedback.trim();
    if (!trimmed) {
      finish();
      return;
    }
    setLoading(true);
    setErrorPhase(null);
    try {
      const supabase = createClient();
      const { error: submitError } = await submitConversationRatingFeedback(
        supabase,
        conversationId,
        trimmed,
      );
      if (submitError) {
        logMentorRatingError("feedback", submitError);
        setErrorPhase("feedback");
        return;
      }
      finish();
    } catch (err) {
      logMentorRatingError("feedback", err);
      setErrorPhase("feedback");
    } finally {
      setLoading(false);
    }
  }

  const activeStars = phase === "stars" ? hover || stars : savedStars;
  const starsFailed = errorPhase === "stars";
  const feedbackFailed = errorPhase === "feedback";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-petrolio/40 p-4 backdrop-blur-sm"
      onClick={() => {
        if (loading) return;
        if (phase === "stars") skipStars();
        else finish();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-conversation-title"
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md rounded-t-[28px] rounded-b-[24px] p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        {phase === "stars" ? (
          <>
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
                  onClick={() => {
                    setStars(n);
                    setErrorPhase(null);
                  }}
                  className="p-1 text-[32px] leading-none transition-transform active:scale-95 disabled:opacity-50"
                >
                  <span className={activeStars >= n ? "text-mint" : "text-cream/18"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            {starsFailed && (
              <RatingNotice>{MENTOR_RATING_STARS_ERROR}</RatingNotice>
            )}
            <div className="mt-6 space-y-3">
              {stars >= 1 && (
                <button
                  type="button"
                  onClick={() => void submitStars()}
                  disabled={loading}
                  className="w-full rounded-full bg-cream py-3.5 text-[15px] font-semibold text-petrolio transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loading
                    ? "Invio…"
                    : starsFailed
                      ? "Riprova"
                      : "Invia"}
                </button>
              )}
              <button
                type="button"
                onClick={skipStars}
                disabled={loading}
                className="w-full py-2 text-[15px] text-cream/55 transition-colors hover:text-cream/75 disabled:opacity-50"
              >
                Salta
              </button>
            </div>
          </>
        ) : (
          <>
            <h2
              id="rate-conversation-title"
              className="font-display text-[20px] leading-snug text-cream"
            >
              Grazie per la valutazione
            </h2>
            <div
              className="mt-4 flex justify-center gap-2"
              aria-label={`Valutazione inviata: ${savedStars} stelle su 5`}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className="p-1 text-[32px] leading-none"
                  aria-hidden
                >
                  <span className={savedStars >= n ? "text-mint" : "text-cream/18"}>
                    ★
                  </span>
                </span>
              ))}
            </div>
            <div className="mt-5">
              <span className="field-label">
                Vuoi aggiungere qualcosa? (facoltativo)
              </span>
              <textarea
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  setErrorPhase(null);
                }}
                placeholder="Solo se ti va. Lo legge la supervisione, non compare sul profilo."
                maxLength={1000}
                rows={4}
                disabled={loading}
                className="field-input mt-2 min-h-[120px]"
              />
            </div>
            {feedbackFailed && (
              <RatingNotice>{MENTOR_RATING_FEEDBACK_ERROR}</RatingNotice>
            )}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => void submitFeedbackAndClose()}
                disabled={loading}
                className="w-full rounded-full bg-cream py-3.5 text-[15px] font-semibold text-petrolio transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Invio…" : feedbackFailed ? "Riprova" : "Fatto"}
              </button>
              <button
                type="button"
                onClick={finish}
                disabled={loading}
                className="w-full py-2 text-[15px] text-cream/55 transition-colors hover:text-cream/75 disabled:opacity-50"
              >
                Chiudi senza aggiungere
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
