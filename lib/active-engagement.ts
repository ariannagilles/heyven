export const ACTIVE_ENGAGEMENT_EVENT = "heyven:active-engagement";

/** Call after a successful active contribution (reply, reaction, new content). */
export function recordActiveEngagement(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ACTIVE_ENGAGEMENT_EVENT));
}

/** Subscribe to active-engagement signals. Returns an unsubscribe function. */
export function onActiveEngagement(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => callback();
  window.addEventListener(ACTIVE_ENGAGEMENT_EVENT, handler);
  return () => window.removeEventListener(ACTIVE_ENGAGEMENT_EVENT, handler);
}
