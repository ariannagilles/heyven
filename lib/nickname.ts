// Parole gentili per nickname generati: tutte al femminile per garantire
// concordanza grammaticale (es. "luna_silente", "alba_quieta").

const NOUNS = [
  "luna", "stella", "alba", "nuvola", "pioggia", "onda", "eco", "ombra",
  "brezza", "foglia", "isola", "soglia", "riva", "marea", "scogliera",
  "voce", "anima", "neve", "rugiada", "conca", "valle", "costa", "baia",
  "lanterna", "candela", "finestra", "veranda", "radura", "sorgente",
  "quercia", "betulla", "viola", "rosa", "magnolia", "ortensia",
  "nebbia", "aurora", "cometa", "galassia", "polvere", "carezza",
];

const ADJS = [
  "silente", "lieve", "gentile", "dolce", "quieta", "calma", "serena",
  "tenera", "lenta", "chiara", "lucida", "candida", "vasta", "profonda",
  "remota", "libera", "sospesa", "fragile", "viva", "intatta",
  "lontana", "vicina", "antica", "nuova", "leggera", "infinita",
  "sincera", "curiosa", "ostinata", "paziente",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomNickname(): string {
  const noun = pick(NOUNS);
  const adj = pick(ADJS);
  // 80% senza suffisso numerico, 20% con 2 cifre per varietà / unicità
  const suffix = Math.random() < 0.8 ? "" : `_${Math.floor(Math.random() * 90 + 10)}`;
  return `${noun}_${adj}${suffix}`;
}
