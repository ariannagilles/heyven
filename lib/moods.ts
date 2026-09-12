import type { ComponentType } from "react";
import {
  ClearIcon,
  CloudIcon,
  StormIcon,
  SunIcon,
  VariableIcon,
  type WeatherIconProps,
} from "@/components/icons/WeatherIcons";

export const MOODS = [
  {
    key: "storm",
    label: "temporale",
    color: "#04342C",
    phrase:
      "Giornata di tempesta. Qui c'è un riparo dove aspettare che passi, e qualcuno con cui ballare sotto la pioggia.",
  },
  {
    key: "cloudy",
    label: "nuvolo",
    color: "#0B3F34",
    phrase: "Giornata un po' grigia. Se ti va, raccontala.",
  },
  {
    key: "variable",
    label: "variabile",
    color: "#0F6E56",
    phrase: "Su e giù, capita. Se ti va di scriverne, ci siamo.",
  },
  {
    key: "clear",
    label: "sereno",
    color: "#1D9E75",
    phrase: "Una buona giornata. Bello leggerlo.",
  },
  {
    key: "sunny",
    label: "sole pieno",
    color: "#5DCAA5",
    phrase: "Oggi si respira. Goditela.",
  },
] as const;

export const MOOD_TAGS = [
  { key: "work", label: "lavoro" },
  { key: "relationships", label: "relazioni" },
  { key: "body", label: "corpo" },
  { key: "loneliness", label: "solitudine" },
  { key: "sleep", label: "sonno" },
  { key: "unknown", label: "non lo so" },
] as const;

export type MoodKey = (typeof MOODS)[number]["key"];
export type MoodTagKey = (typeof MOOD_TAGS)[number]["key"];

const MOOD_BY_KEY: Record<MoodKey, (typeof MOODS)[number]> = MOODS.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<MoodKey, (typeof MOODS)[number]>,
);

const TAG_BY_KEY: Record<MoodTagKey, (typeof MOOD_TAGS)[number]> = MOOD_TAGS.reduce(
  (acc, t) => {
    acc[t.key] = t;
    return acc;
  },
  {} as Record<MoodTagKey, (typeof MOOD_TAGS)[number]>,
);

export function moodByKey(key: MoodKey) {
  return MOOD_BY_KEY[key];
}

export function tagByKey(key: MoodTagKey) {
  return TAG_BY_KEY[key];
}

export const MOOD_ICON_BY_KEY: Record<
  MoodKey,
  ComponentType<WeatherIconProps>
> = {
  storm: StormIcon,
  cloudy: CloudIcon,
  variable: VariableIcon,
  clear: ClearIcon,
  sunny: SunIcon,
};

/** Su fondo scuro, temporale e nuvolo usano teal-mid altrimenti spariscono. */
export function moodIconColor(key: MoodKey): string {
  if (key === "storm" || key === "cloudy") return "#1D9E75";
  return MOOD_BY_KEY[key].color;
}

export function isMoodKey(v: unknown): v is MoodKey {
  return typeof v === "string" && v in MOOD_BY_KEY;
}

export function isMoodTagKey(v: unknown): v is MoodTagKey {
  return typeof v === "string" && v in TAG_BY_KEY;
}

export function localDateISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
