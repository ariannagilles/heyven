"use server";

import type { FeedPost } from "@/components/PostCard";
import { fetchFeed } from "@/lib/feed";
import {
  getOwnPosts,
  getOwnQuestions,
  getOwnStories,
  type OwnPostRow,
  type OwnQuestionRow,
  type OwnStoryRow,
} from "@/lib/profile";
import {
  getQuestions,
  getStories,
  type QuestionRow,
  type StoryRow,
} from "@/lib/space-content";
import {
  fetchUnifiedHomeFeed,
  fetchUnifiedSpaceFeed,
  type MixedFeedItem,
  type UnifiedFeedCursor,
  type UnifiedPageResult,
  EMPTY_UNIFIED_PAGE,
} from "@/lib/unified-feed";
import {
  postToMixedItem,
  questionToMixedItem,
  storyToMixedItem,
  type SpaceFeedFilter,
  type SpaceFeedPage,
} from "@/lib/space-feed";
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

export async function loadMoreSpaceQuestions(
  spaceSlug: string,
  cursor: FeedCursor,
): Promise<PageResult<QuestionRow>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_PAGE<QuestionRow>();

  return getQuestions(supabase, spaceSlug, { cursor });
}

export async function loadMoreSpaceStories(
  spaceSlug: string,
  cursor: FeedCursor,
): Promise<PageResult<StoryRow>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_PAGE<StoryRow>();

  return getStories(supabase, spaceSlug, user.id, { cursor });
}

export async function loadMoreOwnPosts(
  cursor: FeedCursor,
): Promise<PageResult<OwnPostRow>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_PAGE<OwnPostRow>();

  return getOwnPosts(supabase, user.id, { cursor });
}

export async function loadMoreOwnQuestions(
  cursor: FeedCursor,
): Promise<PageResult<OwnQuestionRow>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_PAGE<OwnQuestionRow>();

  return getOwnQuestions(supabase, user.id, { cursor });
}

export async function loadMoreOwnStories(
  cursor: FeedCursor,
): Promise<PageResult<OwnStoryRow>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_PAGE<OwnStoryRow>();

  return getOwnStories(supabase, user.id, { cursor });
}

export async function loadMoreHomeFeed(
  cursor: UnifiedFeedCursor,
): Promise<UnifiedPageResult<MixedFeedItem>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_UNIFIED_PAGE<MixedFeedItem>();

  return fetchUnifiedHomeFeed(supabase, user.id, { unifiedCursor: cursor });
}

export async function loadMoreSpaceFeed(
  spaceSlug: string,
  filter: SpaceFeedFilter,
  cursor: SpaceFeedPage["nextCursor"],
): Promise<SpaceFeedPage> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { items: [], nextCursor: null, hasMore: false };
  }

  if (filter === "tutto") {
    const result = await fetchUnifiedSpaceFeed(supabase, user.id, spaceSlug, {
      unifiedCursor: cursor as UnifiedFeedCursor | null,
    });
    return {
      items: result.items,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  if (filter === "sfogo") {
    const result = await fetchFeed(supabase, user.id, {
      spaceSlug,
      cursor: cursor as FeedCursor | undefined,
    });
    return {
      items: result.items.map(postToMixedItem),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  if (filter === "domanda") {
    const result = await getQuestions(supabase, spaceSlug, {
      cursor: cursor as FeedCursor | undefined,
    });
    return {
      items: result.items.map((q) => questionToMixedItem(q, spaceSlug)),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }

  const result = await getStories(supabase, spaceSlug, user.id, {
    cursor: cursor as FeedCursor | undefined,
  });
  return {
    items: result.items.map((s) => storyToMixedItem(s, spaceSlug)),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  };
}

export async function fetchSpaceFeedInitial(
  spaceSlug: string,
  filter: SpaceFeedFilter,
): Promise<SpaceFeedPage> {
  return loadMoreSpaceFeed(spaceSlug, filter, null);
}
