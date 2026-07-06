import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedPost } from "@/components/PostCard";

type RawPost = {
  id: string;
  content: string;
  created_at: string;
  space_slug: string;
  profiles: { nickname: string } | null;
  replies: { count: number }[] | null;
  me_too: { count: number }[] | null;
};

export async function fetchFeed(
  supabase: SupabaseClient,
  userId: string,
  opts: { spaceSlug?: string; limit?: number } = {},
): Promise<FeedPost[]> {
  const limit = opts.limit ?? 50;

  let query = supabase
    .from("posts")
    .select(
      "id, content, created_at, space_slug, profiles!posts_author_id_fkey(nickname), replies(count), me_too(count)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts.spaceSlug) query = query.eq("space_slug", opts.spaceSlug);

  const { data: posts, error } = await query;
  if (error || !posts) return [];

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

  return rawPosts.map((p) => ({
    id: p.id,
    content: p.content,
    created_at: p.created_at,
    space_slug: p.space_slug,
    nickname: p.profiles?.nickname ?? "anonimo",
    replyCount: p.replies?.[0]?.count ?? 0,
    meTooCount: p.me_too?.[0]?.count ?? 0,
    meToo: mineSet.has(p.id),
  }));
}
