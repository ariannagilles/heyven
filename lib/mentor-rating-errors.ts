export const MENTOR_RATING_STARS_ERROR =
  "Non siamo riusciti a salvare la tua valutazione. Riprova tra un momento.";

export const MENTOR_RATING_FEEDBACK_ERROR =
  "La tua valutazione è salva. Non siamo riusciti ad aggiungere il tuo messaggio — puoi riprovare o chiudere.";

export function logMentorRatingError(
  context: "stars" | "feedback",
  detail: unknown,
): void {
  console.error(`[mentor-rating:${context}]`, detail);
}
