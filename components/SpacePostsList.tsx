"use client";

import { useCallback, useState } from "react";
import PostCardClient from "@/components/PostCardClient";
import BreakReminderBanner from "@/components/infinite-scroll/BreakReminderBanner";
import InfiniteListFooter from "@/components/infinite-scroll/InfiniteListFooter";
import { useInfiniteScroll } from "@/components/infinite-scroll/useInfiniteScroll";
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
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) return;

    setIsLoading(true);
    try {
      const result = await loadMoreSpacePosts(spaceSlug, cursor);
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = result.items.filter((p) => !seen.has(p.id));
        return [...prev, ...fresh];
      });
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading, spaceSlug]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
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
