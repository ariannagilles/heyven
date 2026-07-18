import type { SupabaseClient } from "@supabase/supabase-js";

export type TextContentTable = "posts" | "questions";

export type TextContentUpdate = {
  content: string;
  at_risk: boolean;
};

export type StoryContentUpdate = {
  content: string;
  title: string | null;
  at_risk: boolean;
};

export type ContentUpdateResult =
  | { updatedAt: string; error: null }
  | { updatedAt: null; error: Error };

export async function updateTextContent(
  supabase: SupabaseClient,
  table: TextContentTable,
  id: string,
  payload: TextContentUpdate,
): Promise<ContentUpdateResult> {
  const { data, error } = await supabase
    .from(table)
    .update({
      content: payload.content,
      at_risk: payload.at_risk,
    })
    .eq("id", id)
    .select("updated_at")
    .single();

  if (error) return { updatedAt: null, error: new Error(error.message) };
  return { updatedAt: (data as { updated_at: string }).updated_at, error: null };
}

export async function updateStoryContent(
  supabase: SupabaseClient,
  id: string,
  payload: StoryContentUpdate,
): Promise<ContentUpdateResult> {
  const { data, error } = await supabase
    .from("stories")
    .update({
      content: payload.content,
      title: payload.title,
      at_risk: payload.at_risk,
    })
    .eq("id", id)
    .select("updated_at")
    .single();

  if (error) return { updatedAt: null, error: new Error(error.message) };
  return { updatedAt: (data as { updated_at: string }).updated_at, error: null };
}
