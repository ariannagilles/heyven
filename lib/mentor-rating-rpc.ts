import type { SupabaseClient } from "@supabase/supabase-js";

function normalizeStars(stars: number): number {
  return Math.min(5, Math.max(1, Math.round(stars)));
}

/** Salva il voto 1–5 via RPC submit_rating (solo titolare conversazione). */
export async function submitConversationRating(
  supabase: SupabaseClient,
  conversationId: string,
  stars: number,
) {
  return supabase.rpc("submit_rating", {
    p_conversation_id: conversationId,
    p_rating: normalizeStars(stars),
  });
}

/** Feedback privato per la supervisione (dopo le stelle). */
export async function submitConversationRatingFeedback(
  supabase: SupabaseClient,
  conversationId: string,
  feedback: string,
) {
  return supabase.rpc("submit_rating_feedback", {
    p_conversation_id: conversationId,
    p_feedback: feedback.trim(),
  });
}

/** True se l'utente corrente ha già votato questa conversazione. */
export async function hasRatedConversation(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_rated_conversation", {
    p_conversation_id: conversationId,
  });
  if (error) return false;
  return data === true;
}
