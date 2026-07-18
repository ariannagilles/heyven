import type { SupabaseClient } from "@supabase/supabase-js";
import { avatarDataUri } from "@/lib/avatar";
import {
  applyFeedCursor,
  PAGE_SIZE,
  pageFromRows,
  type PageOpts,
  type PageResult,
} from "@/lib/pagination";

// ----- QUESTIONS ---------------------------------------------

export type QuestionRow = {
  id: string;
  content: string;
  created_at: string;
  nickname: string;
  reply_count: number;
  avatarSrc: string;
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
  opts: PageOpts = {},
): Promise<PageResult<QuestionRow>> {
  const limit = opts.limit ?? PAGE_SIZE;

  let query = supabase
    .from("questions")
    .select(
      "id, content, created_at, profiles!questions_author_id_fkey(nickname), question_replies(count)",
    )
    .eq("space_slug", spaceSlug)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  query = applyFeedCursor(query, opts.cursor);

  const { data } = await query;
  const mapped = ((data as unknown as RawQuestion[]) ?? []).map((q) => {
    const nickname = q.profiles?.nickname ?? "anonimo";
    return {
      id: q.id,
      content: q.content,
      created_at: q.created_at,
      nickname,
      reply_count: q.question_replies?.[0]?.count ?? 0,
      avatarSrc: avatarDataUri(nickname),
    };
  });

  return pageFromRows(mapped, limit);
}

export type QuestionDetail = {
  id: string;
  space_slug: string;
  author_id: string;
  content: string;
  created_at: string;
  nickname: string;
  at_risk: boolean;
};

type RawQuestionDetail = {
  id: string;
  space_slug: string;
  author_id: string;
  content: string;
  created_at: string;
  at_risk: boolean;
  profiles: { nickname: string } | null;
};

export async function getQuestion(
  supabase: SupabaseClient,
  qid: string,
): Promise<QuestionDetail | null> {
  const { data } = await supabase
    .from("questions")
    .select("id, space_slug, author_id, content, created_at, at_risk, profiles!questions_author_id_fkey(nickname)")
    .eq("id", qid)
    .maybeSingle();
  if (!data) return null;
  const q = data as unknown as RawQuestionDetail;
  return {
    id: q.id,
    space_slug: q.space_slug,
    author_id: q.author_id,
    content: q.content,
    created_at: q.created_at,
    nickname: q.profiles?.nickname ?? "anonimo",
    at_risk: q.at_risk ?? false,
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
    .select("id, content, created_at, profiles!question_replies_author_id_fkey(nickname)")
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
  author_id: string;
  title: string | null;
  content: string;
  created_at: string;
  nickname: string;
  reaction_count: number;
  has_reacted: boolean;
  at_risk: boolean;
  avatarSrc: string;
};

type RawStory = {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  created_at: string;
  at_risk: boolean;
  profiles: { nickname: string } | null;
  story_reactions: { count: number }[] | null;
};

export async function getStories(
  supabase: SupabaseClient,
  spaceSlug: string,
  userId: string,
  opts: PageOpts = {},
): Promise<PageResult<StoryRow>> {
  const limit = opts.limit ?? PAGE_SIZE;

  let query = supabase
    .from("stories")
    .select(
      "id, author_id, title, content, created_at, at_risk, profiles!stories_author_id_fkey(nickname), story_reactions(count)",
    )
    .eq("space_slug", spaceSlug)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  query = applyFeedCursor(query, opts.cursor);

  const { data } = await query;
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

  const mapped = rows.map((s) => {
    const nickname = s.profiles?.nickname ?? "anonimo";
    return {
      id: s.id,
      author_id: s.author_id,
      title: s.title,
      content: s.content,
      created_at: s.created_at,
      nickname,
      reaction_count: s.story_reactions?.[0]?.count ?? 0,
      has_reacted: mineSet.has(s.id),
      at_risk: s.at_risk ?? false,
      avatarSrc: avatarDataUri(nickname),
    };
  });

  return pageFromRows(mapped, limit);
}
