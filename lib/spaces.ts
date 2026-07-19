export type Space = {
  slug: string;
  name: string;
  description: string;
  emoji: string;
};

export const SPACES: Space[] = [
  { slug: "ansia",       name: "Ansia",       description: "Quando il cuore corre e la testa non si ferma.",  emoji: "🌀" },
  { slug: "depressione", name: "Depressione", description: "Per i giorni in cui anche alzarsi pesa.",     emoji: "🌧️" },
  { slug: "dca",         name: "Cibo e corpo", description: "Il rapporto con il cibo e con il corpo, senza giudizio.",            emoji: "🌿" },
  { slug: "burnout",     name: "Burnout",     description: "Quando non ne puoi più e ti senti svuotato.",      emoji: "🔥" },
  { slug: "relazioni",   name: "Relazioni",   description: "Legami che feriscono, mancano o confondono.",      emoji: "🫂" },
  { slug: "solitudine",  name: "Solitudine",  description: "Quando ti senti solo, anche in mezzo agli altri.",         emoji: "🌙" },
  { slug: "lutto",       name: "Lutto",       description: "Per chi porta il peso di una perdita.",                                  emoji: "🕊️" },
  { slug: "identita",    name: "Identità",    description: "Domande su chi sei e chi vuoi essere.",  emoji: "✨" },
];

export const SPACE_BY_SLUG: Record<string, Space> = Object.fromEntries(
  SPACES.map((s) => [s.slug, s]),
);
