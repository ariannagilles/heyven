import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyFeedCursor,
  PAGE_SIZE,
  pageFromRows,
  type PageOpts,
  type PageResult,
} from "@/lib/pagination";

export type UserStats = {
  posts_count: number;
  questions_count: number;
  stories_count: number;
  reactions_received: number;
};

export async function getUserStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserStats> {
  const { data } = await supabase.rpc("get_user_stats", { p_user_id: userId });
  const rows = (data as UserStats[] | null) ?? [];
  const r = rows[0];
  if (!r) return { posts_count: 0, questions_count: 0, stories_count: 0, reactions_received: 0 };
  return {
    posts_count: Number(r.posts_count),
    questions_count: Number(r.questions_count),
    stories_count: Number(r.stories_count),
    reactions_received: Number(r.reactions_received),
  };
}

export type OwnPostRow = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  reply_count: number;
  me_too_count: number;
};

type RawOwnPost = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  replies: { count: number }[] | null;
  me_too: { count: number }[] | null;
};

export async function getOwnPosts(
  supabase: SupabaseClient,
  userId: string,
  opts: PageOpts = {},
): Promise<PageResult<OwnPostRow>> {
  const limit = opts.limit ?? PAGE_SIZE;

  let query = supabase
    .from("posts")
    .select("id, space_slug, content, created_at, updated_at, replies(count), me_too(count)")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  query = applyFeedCursor(query, opts.cursor);

  const { data } = await query;
  const mapped = ((data as unknown as RawOwnPost[]) ?? []).map((p) => ({
    id: p.id,
    space_slug: p.space_slug,
    content: p.content,
    created_at: p.created_at,
    updated_at: p.updated_at ?? null,
    reply_count: p.replies?.[0]?.count ?? 0,
    me_too_count: p.me_too?.[0]?.count ?? 0,
  }));

  return pageFromRows(mapped, limit);
}

export type OwnQuestionRow = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  reply_count: number;
};

type RawOwnQuestion = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  question_replies: { count: number }[] | null;
};

export async function getOwnQuestions(
  supabase: SupabaseClient,
  userId: string,
  opts: PageOpts = {},
): Promise<PageResult<OwnQuestionRow>> {
  const limit = opts.limit ?? PAGE_SIZE;

  let query = supabase
    .from("questions")
    .select("id, space_slug, content, created_at, updated_at, question_replies(count)")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  query = applyFeedCursor(query, opts.cursor);

  const { data } = await query;
  const mapped = ((data as unknown as RawOwnQuestion[]) ?? []).map((q) => ({
    id: q.id,
    space_slug: q.space_slug,
    content: q.content,
    created_at: q.created_at,
    updated_at: q.updated_at ?? null,
    reply_count: q.question_replies?.[0]?.count ?? 0,
  }));

  return pageFromRows(mapped, limit);
}

export type OwnStoryRow = {
  id: string;
  space_slug: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string | null;
  reaction_count: number;
};

type RawOwnStory = {
  id: string;
  space_slug: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string | null;
  story_reactions: { count: number }[] | null;
};

export async function getOwnStories(
  supabase: SupabaseClient,
  userId: string,
  opts: PageOpts = {},
): Promise<PageResult<OwnStoryRow>> {
  const limit = opts.limit ?? PAGE_SIZE;

  let query = supabase
    .from("stories")
    .select("id, space_slug, title, content, created_at, updated_at, story_reactions(count)")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  query = applyFeedCursor(query, opts.cursor);

  const { data } = await query;
  const mapped = ((data as unknown as RawOwnStory[]) ?? []).map((s) => ({
    id: s.id,
    space_slug: s.space_slug,
    title: s.title,
    content: s.content,
    created_at: s.created_at,
    updated_at: s.updated_at ?? null,
    reaction_count: s.story_reactions?.[0]?.count ?? 0,
  }));

  return pageFromRows(mapped, limit);
}

export type MemberSince = { joinedAt: string };

export async function getJoinedAt(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", userId)
    .maybeSingle();
  return (data as { created_at: string } | null)?.created_at ?? null;
}

export async function getClosedConversationsCountForMentor(
  supabase: SupabaseClient,
  mentorId: string,
): Promise<number> {
  const { count } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("mentor_id", mentorId)
    .eq("status", "closed");
  return count ?? 0;
}
