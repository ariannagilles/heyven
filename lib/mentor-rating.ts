import type { SupabaseClient } from "@supabase/supabase-js";

export const MIN_MENTOR_RATINGS_DISPLAY = 5;

export type MentorRatingSummary = {
  avg: number;
  count: number;
};

export function mentorRatingColor(avg: number): string {
  if (avg >= 4.3) return "#5DCAA5";
  if (avg >= 3.5) return "#1D9E75";
  if (avg >= 2.5) return "#CDA24E";
  return "#B9AE93";
}

export function starFillForIndex(avg: number, index: number): number {
  return Math.min(1, Math.max(0, avg - (index - 1)));
}

type SummaryRow = { avg_stars: number; rating_count: number };

/** Media e conteggio via RPC get_mentor_rating_summary (nessun voto singolo). */
export async function fetchMentorRatingSummary(
  supabase: SupabaseClient,
  mentorId: string,
): Promise<MentorRatingSummary> {
  const { data, error } = await supabase.rpc("get_mentor_rating_summary", {
    p_mentor_id: mentorId,
  });

  if (!error && data) {
    const row = Array.isArray(data)
      ? (data as SummaryRow[])[0]
      : (data as SummaryRow);
    if (row) {
      return {
        avg: Number(row.avg_stars),
        count: Number(row.rating_count),
      };
    }
  }

  return { avg: 0, count: 0 };
}
