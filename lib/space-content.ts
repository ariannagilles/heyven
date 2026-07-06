import type { SupabaseClient } from "@supabase/supabase-js";

// ----- QUESTIONS ---------------------------------------------

export type QuestionRow = {
  id: string;
  content: string;
  created_at: string;
  nickname: string;
  reply_count: number;
};

type RawQuestion = {
  id: string;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
  question_replies: { count: number }[] | null;
};

export async function getQuestions(
  supabase: SupabaseClient,
  spaceSlug: string,
): Promise<QuestionRow[]> {
  const { data } = await supabase
    .from("questions")
    .select("id, content, created_at, profiles(nickname), question_replies(count)")
    .eq("space_slug", spaceSlug)
    .order("created_at", { ascending: false });

  return ((data as unknown as RawQuestion[]) ?? []).map((q) => ({
    id: q.id,
    content: q.content,
    created_at: q.created_at,
    nickname: q.profiles?.nickname ?? "anonimo",
    reply_count: q.question_replies?.[0]?.count ?? 0,
  }));
}

export type QuestionDetail = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  nickname: string;
};

type RawQuestionDetail = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
};

export async function getQuestion(
  supabase: SupabaseClient,
  qid: string,
): Promise<QuestionDetail | null> {
  const { data } = await supabase
    .from("questions")
    .select("id, space_slug, content, created_at, profiles(nickname)")
    .eq("id", qid)
    .maybeSingle();
  if (!data) return null;
  const q = data as unknown as RawQuestionDetail;
  return {
    id: q.id,
    space_slug: q.space_slug,
    content: q.content,
    created_at: q.created_at,
    nickname: q.profiles?.nickname ?? "anonimo",
  };
}

export type QuestionReply = {
  id: string;
  content: string;
  created_at: string;
  nickname: string;
};

type RawReply = {
  id: string;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
};

export async function getQuestionReplies(
  supabase: SupabaseClient,
  qid: string,
): Promise<QuestionReply[]> {
  const { data } = await supabase
    .from("question_replies")
    .select("id, content, created_at, profiles(nickname)")
    .eq("question_id", qid)
    .order("created_at", { ascending: true });
  return ((data as unknown as RawReply[]) ?? []).map((r) => ({
    id: r.id,
    content: r.content,
    created_at: r.created_at,
    nickname: r.profiles?.nickname ?? "anonimo",
  }));
}

// ----- STORIES -----------------------------------------------

export type StoryRow = {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  nickname: string;
  reaction_count: number;
  has_reacted: boolean;
};

type RawStory = {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
  story_reactions: { count: number }[] | null;
};

export async function getStories(
  supabase: SupabaseClient,
  spaceSlug: string,
  userId: string,
): Promise<StoryRow[]> {
  const { data } = await supabase
    .from("stories")
    .select(
      "id, title, content, created_at, profiles(nickname), story_reactions(count)",
    )
    .eq("space_slug", spaceSlug)
    .order("created_at", { ascending: false });

  const rows = (data as unknown as RawStory[]) ?? [];
  const ids = rows.map((s) => s.id);

  let mineSet = new Set<string>();
  if (ids.length > 0) {
    const { data: mine } = await supabase
      .from("story_reactions")
      .select("story_id")
      .eq("user_id", userId)
      .in("story_id", ids);
    mineSet = new Set(
      ((mine ?? []) as { story_id: string }[]).map((r) => r.story_id),
    );
  }

  return rows.map((s) => ({
    id: s.id,
    title: s.title,
    content: s.content,
    created_at: s.created_at,
    nickname: s.profiles?.nickname ?? "anonimo",
    reaction_count: s.story_reactions?.[0]?.count ?? 0,
    has_reacted: mineSet.has(s.id),
  }));
}
