export type Space = {
  slug: string;
  name: string;
  description: string;
  emoji: string;
};

/** Slug invariati; name ed emoji sono le etichette mostrate in app. */
export const SPACES: Space[] = [
  {
    slug: "ansia",
    name: "Sempre in allerta",
    description: "Quando il cuore corre e la testa non si ferma.",
    emoji: "🌊",
  },
  {
    slug: "depressione",
    name: "Le giornate senza colore",
    description: "Per i giorni in cui anche alzarsi pesa.",
    emoji: "🌧",
  },
  {
    slug: "dca",
    name: "Cibo e corpo",
    description: "Il rapporto con il cibo e con il corpo, senza giudizio.",
    emoji: "🍽",
  },
  {
    slug: "burnout",
    name: "Il peso delle responsabilità",
    description: "Quando non ne puoi più e ti senti svuotato.",
    emoji: "🔥",
  },
  {
    slug: "relazioni",
    name: "Legami che fanno male",
    description: "Legami che feriscono, mancano o confondono.",
    emoji: "💔",
  },
  {
    slug: "solitudine",
    name: "Sentirsi soli",
    description: "Quando ti senti solo, anche in mezzo agli altri.",
    emoji: "🌑",
  },
  {
    slug: "lutto",
    name: "Imparare a dire addio",
    description: "Per chi porta il peso di una perdita.",
    emoji: "🕯",
  },
  {
    slug: "identita",
    name: "Capire chi sono",
    description: "Domande su chi sei e chi vuoi essere.",
    emoji: "🔍",
  },
];

export const SPACE_BY_SLUG: Record<string, Space> = Object.fromEntries(
  SPACES.map((s) => [s.slug, s]),
);
