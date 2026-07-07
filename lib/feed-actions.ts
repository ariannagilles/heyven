"use server";

import type { FeedPost } from "@/components/PostCard";
import { fetchFeed } from "@/lib/feed";
import { EMPTY_PAGE, type FeedCursor, type PageResult } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

export async function loadMoreSpacePosts(
  spaceSlug: string,
  cursor: FeedCursor,
): Promise<PageResult<FeedPost>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_PAGE<FeedPost>();

  return fetchFeed(supabase, user.id, { spaceSlug, cursor });
}
