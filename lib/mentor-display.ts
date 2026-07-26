import { SPACES } from "@/lib/spaces";

export const MENTOR_PREVIEW = {
  nickname: "Luna",
  intro_text:
    "Sono qui perché qualcuno c'è stato per me quando ne avevo bisogno. Ora voglio fare lo stesso, senza giudicare.",
  experience_areas: ["ansia", "solitudine"] as string[],
  months_here: 8,
  people_accompanied: 47,
};

export function monthsSince(dateIso: string): number {
  const start = new Date(dateIso);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(1, months);
}

export function experienceAreaLabels(slugs: string[]): string[] {
  return slugs
    .map((slug) => SPACES.find((s) => s.slug === slug)?.name)
    .filter(Boolean) as string[];
}
