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

export async function fetchMentorRatingSummary(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  mentorId: string,
  fallback?: MentorRatingSummary,
): Promise<MentorRatingSummary> {
  const { data, error } = await supabase.rpc("get_mentor_rating_summary", {
    p_mentor_id: mentorId,
  });

  if (!error && data && (data as { avg_stars: number; rating_count: number }[]).length > 0) {
    const row = (data as { avg_stars: number; rating_count: number }[])[0];
    return {
      avg: Number(row.avg_stars),
      count: Number(row.rating_count),
    };
  }

  return fallback ?? { avg: 0, count: 0 };
}
