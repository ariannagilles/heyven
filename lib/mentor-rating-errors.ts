/** Messaggio leggibile per l'utente; mai errori SQL grezzi. */
export function mentorRatingUserMessage(raw: string | undefined | null): string {
  if (!raw?.trim()) {
    return "Non siamo riusciti a salvare la valutazione. Riprova tra poco.";
  }
  const lower = raw.toLowerCase();
  if (
    lower.includes("not authenticated") ||
    lower.includes("jwt") ||
    lower.includes("permission")
  ) {
    return "Accedi di nuovo e riprova.";
  }
  if (lower.includes("conversation not found") || lower.includes("no conversation")) {
    return "Questa conversazione non è più disponibile.";
  }
  if (lower.includes("only the user")) {
    return "Solo chi ha avuto la conversazione può lasciare una valutazione.";
  }
  if (lower.includes("invalid rating")) {
    return "Scegli da 1 a 5 stelle.";
  }
  if (lower.includes("feedback is empty") || lower.includes("feedback too long")) {
    return "Il messaggio non è valido. Tienilo sotto i 1000 caratteri.";
  }
  if (lower.includes("rating not found")) {
    return "Invia prima le stelle, poi il feedback.";
  }
  return "Non siamo riusciti a salvare. Riprova tra poco.";
}
