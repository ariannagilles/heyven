/**
 * Pattern a rischio acuto (italiano). Case-insensitive.
 * Rivisita e aggiorna questa lista quando serve.
 */
export const AT_RISK_PATTERNS = [
  "non voglio più vivere",
  "non voglio piu vivere",
  "non voglio più esserci",
  "non voglio piu esserci",
  "non voglio più esistere",
  "non voglio piu esistere",
  "voglio morire",
  "voglio farla finita",
  "farla finita",
  "togliermi la vita",
  "togliere la vita",
  "suicid",
  "suicidio",
  "ammazzarmi",
  "uccidermi",
  "farmi del male",
  "farsi del male",
  "tagliarmi",
  "non ce la faccio più",
  "non ce la faccio piu",
  "non ce la faccio",
  "addio per sempre",
  "ultimo messaggio",
  "non sarò più",
  "non saro piu",
  "non ci sarò più",
  "non ci saro piu",
  "piano per morire",
  "piano per uccidermi",
  "voglio sparire per sempre",
  "non voglio svegliarmi",
  "meglio morto",
  "meglio morta",
  "non ha più senso vivere",
  "non ha piu senso vivere",
] as const;

export function detectAtRisk(...texts: (string | null | undefined)[]): boolean {
  const combined = texts
    .filter((t): t is string => Boolean(t?.trim()))
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (!combined) return false;

  return AT_RISK_PATTERNS.some((pattern) => {
    const normalized = pattern
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
    return combined.includes(normalized);
  });
}
