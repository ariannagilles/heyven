const AUTO_PROMPT_PREFIX = "heyven_rating_auto_";

export function autoRatingPromptKey(conversationId: string): string {
  return `${AUTO_PROMPT_PREFIX}${conversationId}`;
}

export function wasAutoRatingPromptDismissed(conversationId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(autoRatingPromptKey(conversationId)) === "1";
}

export function markAutoRatingPromptDismissed(conversationId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(autoRatingPromptKey(conversationId), "1");
}

export const AUTO_RATING_MIN_TOTAL_MESSAGES = 20;
export const AUTO_RATING_MIN_MENTOR_MESSAGES = 5;
