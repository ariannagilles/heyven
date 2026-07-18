"use client";

import { useCallback } from "react";
import MixedFeedItemClient from "@/components/MixedFeedItemClient";
import BreakReminderBanner from "@/components/infinite-scroll/BreakReminderBanner";
import InfiniteListFooter from "@/components/infinite-scroll/InfiniteListFooter";
import { usePaginatedFeed } from "@/components/infinite-scroll/usePaginatedFeed";
import { loadMoreHomeFeed } from "@/lib/feed-actions";
import type { MixedFeedItem, UnifiedFeedCursor } from "@/lib/unified-feed";

type HomeFeedListProps = {
  viewerId: string;
  initialItems: MixedFeedItem[];
  initialNextCursor: UnifiedFeedCursor | null;
  initialHasMore: boolean;
};

export default function HomeFeedList({
  viewerId,
  initialItems,
  initialNextCursor,
  initialHasMore,
}: HomeFeedListProps) {
  const loadMoreFn = useCallback(
    (cursor: UnifiedFeedCursor) => loadMoreHomeFeed(cursor),
    [],
  );

  const { items, isLoading, hasMore, sentinelRef } = usePaginatedFeed<
    MixedFeedItem,
    UnifiedFeedCursor
  >({
    initialItems,
    initialNextCursor,
    initialHasMore,
    loadMore: loadMoreFn,
    getItemKey: (item) => `${item.kind}-${item.id}`,
  });

  return (
    <>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <MixedFeedItemClient item={item} viewerId={viewerId} />
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
