export type Space = {
  slug: string;
  name: string;
  description: string;
  emoji: string;
};

export const SPACES: Space[] = [
  { slug: "ansia",       name: "Ansia",       description: "Per chi convive con ansia o attacchi di panico.",  emoji: "🌀" },
  { slug: "depressione", name: "Depressione", description: "Uno spazio sicuro per parlare di depressione.",     emoji: "🌧️" },
  { slug: "dca",         name: "DCA",         description: "Disturbi del comportamento alimentare.",            emoji: "🌿" },
  { slug: "burnout",     name: "Burnout",     description: "Stress da lavoro, esaurimento, sovraccarico.",      emoji: "🔥" },
  { slug: "relazioni",   name: "Relazioni",   description: "Famiglia, amicizie, amore, legami difficili.",      emoji: "🫂" },
  { slug: "solitudine",  name: "Solitudine",  description: "Sentirsi soli, anche in mezzo agli altri.",         emoji: "🌙" },
  { slug: "lutto",       name: "Lutto",       description: "Perdita e dolore.",                                  emoji: "🕊️" },
  { slug: "identita",    name: "Identità",    description: "Identità di genere, orientamento, ricerca di sé.",  emoji: "✨" },
];

export const SPACE_BY_SLUG: Record<string, Space> = Object.fromEntries(
  SPACES.map((s) => [s.slug, s]),
);
