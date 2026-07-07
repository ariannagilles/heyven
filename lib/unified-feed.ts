import type { SupabaseClient } from "@supabase/supabase-js";
import { avatarDataUri } from "@/lib/avatar";
import {
  applyFeedCursor,
  compareFeedItems,
  PAGE_SIZE,
  type FeedCursor,
} from "@/lib/pagination";

export type MixedFeedItem =
  | {
      kind: "sfogo";
      id: string;
      space_slug: string;
      nickname: string;
      content: string;
      created_at: string;
      reply_count: number;
      me_too_count: number;
      me_too: boolean;
      avatarSrc: string;
    }
  | {
      kind: "domanda";
      id: string;
      space_slug: string;
      nickname: string;
      content: string;
      created_at: string;
      reply_count: number;
      avatarSrc: string;
    }
  | {
      kind: "storia";
      id: string;
      space_slug: string;
      nickname: string;
      title: string | null;
      content: string;
      created_at: string;
      reaction_count: number;
      has_reacted: boolean;
      avatarSrc: string;
    };

export type UnifiedFeedCursor = {
  sfogo: FeedCursor | null;
  domanda: FeedCursor | null;
  storia: FeedCursor | null;
};

export type UnifiedFeedOpts = {
  limit?: number;
  unifiedCursor?: UnifiedFeedCursor | null;
};

export type UnifiedPageResult<T> = {
  items: T[];
  nextCursor: UnifiedFeedCursor | null;
  hasMore: boolean;
};

export const EMPTY_UNIFIED_PAGE = <T>(): UnifiedPageResult<T> => ({
  items: [],
  nextCursor: null,
  hasMore: false,
});

type FeedKind = MixedFeedItem["kind"];

type RawPost = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
  replies: { count: number }[] | null;
  me_too: { count: number }[] | null;
};

type RawQuestion = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
  question_replies: { count: number }[] | null;
};

type RawStory = {
  id: string;
  space_slug: string;
  title: string | null;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
  story_reactions: { count: number }[] | null;
};

function toFeedCursor(item: MixedFeedItem): FeedCursor {
  return { created_at: item.created_at, id: item.id };
}

function oldestOfKind(items: MixedFeedItem[], kind: FeedKind): MixedFeedItem {
  return items
    .filter((i) => i.kind === kind)
    .reduce((a, b) => (compareFeedItems(a, b) > 0 ? a : b));
}

function newestOfKind(items: MixedFeedItem[], kind: FeedKind): MixedFeedItem {
  return items
    .filter((i) => i.kind === kind)
    .reduce((a, b) => (compareFeedItems(a, b) < 0 ? a : b));
}

function buildNextUnifiedCursor(
  pools: Record<FeedKind, MixedFeedItem[]>,
  pageItems: MixedFeedItem[],
  previous: UnifiedFeedCursor | null,
): UnifiedFeedCursor {
  const next: UnifiedFeedCursor = {
    sfogo: previous?.sfogo ?? null,
    domanda: previous?.domanda ?? null,
    storia: previous?.storia ?? null,
  };

  for (const kind of ["sfogo", "domanda", "storia"] as const) {
    const pool = pools[kind];
    const shown = pageItems.filter((i) => i.kind === kind);

    if (shown.length > 0) {
      next[kind] = toFeedCursor(oldestOfKind(pageItems, kind));
    } else if (pool.length > 0) {
      // Fetched but not shown this page — advance past the newest candidate.
      next[kind] = toFeedCursor(newestOfKind(pool, kind));
    }
  }

  return next;
}

export async function fetchUnifiedHomeFeed(
  supabase: SupabaseClient,
  userId: string,
  opts: UnifiedFeedOpts = {},
): Promise<UnifiedPageResult<MixedFeedItem>> {
  const limit = opts.limit ?? PAGE_SIZE;
  const perTypeFetch = limit + 1;
  const cursors = opts.unifiedCursor ?? {
    sfogo: null,
    domanda: null,
    storia: null,
  };

  let postsQuery = supabase
    .from("posts")
    .select(
      "id, space_slug, content, created_at, profiles!posts_author_id_fkey(nickname), replies(count), me_too(count)",
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(perTypeFetch);
  postsQuery = applyFeedCursor(postsQuery, cursors.sfogo);

  let questionsQuery = supabase
    .from("questions")
    .select(
      "id, space_slug, content, created_at, profiles!questions_author_id_fkey(nickname), question_replies(count)",
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(perTypeFetch);
  questionsQuery = applyFeedCursor(questionsQuery, cursors.domanda);

  let storiesQuery = supabase
    .from("stories")
    .select(
      "id, space_slug, title, content, created_at, profiles!stories_author_id_fkey(nickname), story_reactions(count)",
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(perTypeFetch);
  storiesQuery = applyFeedCursor(storiesQuery, cursors.storia);

  const [postsRes, questionsRes, storiesRes] = await Promise.all([
    postsQuery,
    questionsQuery,
    storiesQuery,
  ]);

  const rawPosts = (postsRes.data as unknown as RawPost[]) ?? [];
  const rawQuestions = (questionsRes.data as unknown as RawQuestion[]) ?? [];
  const rawStories = (storiesRes.data as unknown as RawStory[]) ?? [];

  const postIds = rawPosts.map((p) => p.id);
  const storyIds = rawStories.map((s) => s.id);

  const [myMeTooRes, myStoryReactRes] = await Promise.all([
    postIds.length > 0
      ? supabase
          .from("me_too")
          .select("post_id")
          .eq("user_id", userId)
          .in("post_id", postIds)
      : Promise.resolve({ data: [] as { post_id: string }[] }),
    storyIds.length > 0
      ? supabase
          .from("story_reactions")
          .select("story_id")
          .eq("user_id", userId)
          .in("story_id", storyIds)
      : Promise.resolve({ data: [] as { story_id: string }[] }),
  ]);

  const myMeTooSet = new Set(
    ((myMeTooRes.data ?? []) as { post_id: string }[]).map((r) => r.post_id),
  );
  const myStorySet = new Set(
    ((myStoryReactRes.data ?? []) as { story_id: string }[]).map((r) => r.story_id),
  );

  const sfogoPool = rawPosts.map<MixedFeedItem>((p) => {
    const nickname = p.profiles?.nickname ?? "anonimo";
    return {
      kind: "sfogo",
      id: p.id,
      space_slug: p.space_slug,
      nickname,
      content: p.content,
      created_at: p.created_at,
      reply_count: p.replies?.[0]?.count ?? 0,
      me_too_count: p.me_too?.[0]?.count ?? 0,
      me_too: myMeTooSet.has(p.id),
      avatarSrc: avatarDataUri(nickname),
    };
  });

  const domandaPool = rawQuestions.map<MixedFeedItem>((q) => {
    const nickname = q.profiles?.nickname ?? "anonimo";
    return {
      kind: "domanda",
      id: q.id,
      space_slug: q.space_slug,
      nickname,
      content: q.content,
      created_at: q.created_at,
      reply_count: q.question_replies?.[0]?.count ?? 0,
      avatarSrc: avatarDataUri(nickname),
    };
  });

  const storiaPool = rawStories.map<MixedFeedItem>((s) => {
    const nickname = s.profiles?.nickname ?? "anonimo";
    return {
      kind: "storia",
      id: s.id,
      space_slug: s.space_slug,
      nickname,
      title: s.title,
      content: s.content,
      created_at: s.created_at,
      reaction_count: s.story_reactions?.[0]?.count ?? 0,
      has_reacted: myStorySet.has(s.id),
      avatarSrc: avatarDataUri(nickname),
    };
  });

  const merged = [...sfogoPool, ...domandaPool, ...storiaPool].sort(compareFeedItems);

  const hasMore =
    merged.length > limit ||
    rawPosts.length === perTypeFetch ||
    rawQuestions.length === perTypeFetch ||
    rawStories.length === perTypeFetch;

  const items = merged.slice(0, limit);
  const nextCursor = hasMore
    ? buildNextUnifiedCursor(
        { sfogo: sfogoPool, domanda: domandaPool, storia: storiaPool },
        items,
        opts.unifiedCursor ?? null,
      )
    : null;

  return { items, nextCursor, hasMore };
}
