import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedPost } from "@/components/PostCard";
import { avatarDataUri } from "@/lib/avatar";
import {
  applyFeedCursor,
  PAGE_SIZE,
  pageFromRows,
  type PageOpts,
  type PageResult,
} from "@/lib/pagination";

type RawPost = {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  space_slug: string;
  profiles: { nickname: string } | null;
  replies: { count: number }[] | null;
  me_too: { count: number }[] | null;
};

export async function fetchFeed(
  supabase: SupabaseClient,
  userId: string,
  opts: { spaceSlug?: string } & PageOpts = {},
): Promise<PageResult<FeedPost>> {
  const limit = opts.limit ?? PAGE_SIZE;

  let query = supabase
    .from("posts")
    .select(
      "id, author_id, content, created_at, updated_at, space_slug, profiles!posts_author_id_fkey(nickname), replies(count), me_too(count)",
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (opts.spaceSlug) query = query.eq("space_slug", opts.spaceSlug);
  query = applyFeedCursor(query, opts.cursor);

  const { data: posts, error } = await query;
  if (error || !posts) return { items: [], nextCursor: null, hasMore: false };

  const rawPosts = posts as unknown as RawPost[];
  const ids = rawPosts.map((p) => p.id);

  let mineSet = new Set<string>();
  if (ids.length > 0) {
    const { data: mine } = await supabase
      .from("me_too")
      .select("post_id")
      .eq("user_id", userId)
      .in("post_id", ids);
    mineSet = new Set((mine ?? []).map((r: { post_id: string }) => r.post_id));
  }

  const mapped = rawPosts.map((p) => {
    const nickname = p.profiles?.nickname ?? "anonimo";
    return {
      id: p.id,
      author_id: p.author_id,
      content: p.content,
      created_at: p.created_at,
      updated_at: p.updated_at ?? null,
      space_slug: p.space_slug,
      nickname,
      replyCount: p.replies?.[0]?.count ?? 0,
      meTooCount: p.me_too?.[0]?.count ?? 0,
      meToo: mineSet.has(p.id),
      avatarSrc: avatarDataUri(nickname),
    };
  });

  return pageFromRows(mapped, limit);
}
