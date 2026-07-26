import type { SupabaseClient } from "@supabase/supabase-js";

/** Salva il voto 1–5 via RPC submit_rating (solo titolare conversazione chiusa). */
export async function submitConversationRating(
  supabase: SupabaseClient,
  conversationId: string,
  rating: number,
) {
  return supabase.rpc("submit_rating", {
    p_conversation_id: conversationId,
    p_rating: rating,
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
