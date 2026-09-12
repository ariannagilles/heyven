import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MOOD_TAGS,
  isMoodKey,
  isMoodTagKey,
  type MoodKey,
  type MoodTagKey,
} from "./moods";

function defaultTagOrder(): MoodTagKey[] {
  return MOOD_TAGS.map((t) => t.key);
}

export type DailyCheckin = {
  id: string;
  user_id: string;
  local_date: string;
  weather: MoodKey;
  tags: MoodTagKey[];
  created_at: string;
  updated_at: string;
};

export type CheckinHistoryRow = {
  local_date: string;
  weather: MoodKey;
  tags: MoodTagKey[];
};

function normalizeTags(raw: unknown): MoodTagKey[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isMoodTagKey);
}

function normalizeRow(row: Record<string, unknown> | null): DailyCheckin | null {
  if (!row) return null;
  const weather = row.weather;
  if (!isMoodKey(weather)) return null;
  return {
    id: String(row.id ?? ""),
    user_id: String(row.user_id ?? ""),
    local_date: String(row.local_date ?? ""),
    weather,
    tags: normalizeTags(row.tags),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function normalizeHistoryRow(
  row: Record<string, unknown>,
): CheckinHistoryRow | null {
  const weather = row.weather;
  if (!isMoodKey(weather)) return null;
  return {
    local_date: String(row.local_date ?? ""),
    weather,
    tags: normalizeTags(row.tags),
  };
}

export async function submitCheckin(
  supabase: SupabaseClient,
  params: { localDate: string; weather: MoodKey; tags: MoodTagKey[] },
): Promise<{ data: DailyCheckin | null; error: unknown }> {
  const { data, error } = await supabase.rpc("submit_checkin", {
    p_local_date: params.localDate,
    p_weather: params.weather,
    p_tags: params.tags,
  });
  if (error) return { data: null, error };
  const row = Array.isArray(data) ? data[0] : data;
  return { data: normalizeRow(row ?? null), error: null };
}

export async function getCheckinForDate(
  supabase: SupabaseClient,
  localDate: string,
): Promise<{ data: DailyCheckin | null; error: unknown }> {
  const { data, error } = await supabase
    .rpc("get_checkin_for_date", { p_local_date: localDate })
    .maybeSingle();
  if (error) return { data: null, error };
  return { data: normalizeRow((data as Record<string, unknown>) ?? null), error: null };
}

export async function getPopularMoodTags(
  supabase: SupabaseClient,
): Promise<MoodTagKey[]> {
  const fallback = defaultTagOrder();
  try {
    const { data, error } = await supabase.rpc("get_popular_mood_tags");
    if (error || !Array.isArray(data)) return fallback;

    const ordered: MoodTagKey[] = [];
    for (const row of data) {
      const tag = (row as { tag?: unknown } | null)?.tag;
      if (isMoodTagKey(tag) && !ordered.includes(tag)) {
        ordered.push(tag);
      }
    }
    if (ordered.length === 0) return fallback;
    for (const key of fallback) {
      if (!ordered.includes(key)) ordered.push(key);
    }
    return ordered;
  } catch {
    return fallback;
  }
}

export async function getCheckinHistory(
  supabase: SupabaseClient,
  days = 35,
): Promise<{ data: CheckinHistoryRow[]; error: unknown }> {
  const { data, error } = await supabase.rpc("get_checkin_history", {
    p_days: days,
  });
  if (error) return { data: [], error };
  if (!Array.isArray(data)) return { data: [], error: null };
  const rows = data
    .map((r) => normalizeHistoryRow(r as Record<string, unknown>))
    .filter((r): r is CheckinHistoryRow => r !== null);
  return { data: rows, error: null };
}
