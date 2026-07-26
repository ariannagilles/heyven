import type { SupabaseClient } from "@supabase/supabase-js";

export type TextContentTable = "posts" | "questions";

export type TextContentUpdate = {
  content: string;
  at_risk: boolean;
  markEdited: boolean;
};

export type StoryContentUpdate = {
  content: string;
  title: string | null;
  at_risk: boolean;
  markEdited: boolean;
};

export type ContentUpdateResult =
  | { editedAt: string | null; error: null }
  | { editedAt: null; error: Error };

function withEditedAt<T extends Record<string, unknown>>(
  payload: T,
  markEdited: boolean,
): T & { edited_at?: string } {
  if (!markEdited) return payload;
  return { ...payload, edited_at: new Date().toISOString() };
}

export async function updateTextContent(
  supabase: SupabaseClient,
  table: TextContentTable,
  id: string,
  payload: TextContentUpdate,
): Promise<ContentUpdateResult> {
  const { data, error } = await supabase
    .from(table)
    .update(
      withEditedAt(
        {
          content: payload.content,
          at_risk: payload.at_risk,
        },
        payload.markEdited,
      ),
    )
    .eq("id", id)
    .select("edited_at")
    .single();

  if (error) return { editedAt: null, error: new Error(error.message) };
  return {
    editedAt: (data as { edited_at: string | null }).edited_at,
    error: null,
  };
}

export async function updateStoryContent(
  supabase: SupabaseClient,
  id: string,
  payload: StoryContentUpdate,
): Promise<ContentUpdateResult> {
  const { data, error } = await supabase
    .from("stories")
    .update(
      withEditedAt(
        {
          content: payload.content,
          title: payload.title,
          at_risk: payload.at_risk,
        },
        payload.markEdited,
      ),
    )
    .eq("id", id)
    .select("edited_at")
    .single();

  if (error) return { editedAt: null, error: new Error(error.message) };
  return {
    editedAt: (data as { edited_at: string | null }).edited_at,
    error: null,
  };
}
