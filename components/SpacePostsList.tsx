"use client";

import { useCallback } from "react";
import PostCardClient from "@/components/PostCardClient";
import BreakReminderBanner from "@/components/infinite-scroll/BreakReminderBanner";
import InfiniteListFooter from "@/components/infinite-scroll/InfiniteListFooter";
import { usePaginatedFeed } from "@/components/infinite-scroll/usePaginatedFeed";
import { loadMoreSpacePosts } from "@/lib/feed-actions";
import type { FeedCursor } from "@/lib/pagination";
import type { FeedPost } from "@/components/PostCard";

type SpacePostsListProps = {
  spaceSlug: string;
  initialItems: FeedPost[];
  initialNextCursor: FeedCursor | null;
  initialHasMore: boolean;
};

export default function SpacePostsList({
  spaceSlug,
  initialItems,
  initialNextCursor,
  initialHasMore,
}: SpacePostsListProps) {
  const loadMoreFn = useCallback(
    (cursor: FeedCursor) => loadMoreSpacePosts(spaceSlug, cursor),
    [spaceSlug],
  );

  const { items, isLoading, hasMore, sentinelRef } = usePaginatedFeed({
    initialItems,
    initialNextCursor,
    initialHasMore,
    loadMore: loadMoreFn,
  });

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center text-petrolio/70">
        Nessun post in questo spazio.
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {items.map((post) => (
          <li key={post.id}>
            <PostCardClient post={post} />
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="h-1" aria-hidden />

      <InfiniteListFooter
        isLoading={isLoading}
        hasMore={hasMore}
        itemCount={items.length}
      />

      <BreakReminderBanner />
    </>
  );
}
