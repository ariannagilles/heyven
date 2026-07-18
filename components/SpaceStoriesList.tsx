"use client";

import { useCallback } from "react";
import StoryListItem from "@/components/StoryListItem";
import BreakReminderBanner from "@/components/infinite-scroll/BreakReminderBanner";
import InfiniteListFooter from "@/components/infinite-scroll/InfiniteListFooter";
import { usePaginatedFeed } from "@/components/infinite-scroll/usePaginatedFeed";
import { loadMoreSpaceStories } from "@/lib/feed-actions";
import type { StoryRow } from "@/lib/space-content";
import type { FeedCursor } from "@/lib/pagination";

type SpaceStoriesListProps = {
  spaceSlug: string;
  viewerId: string;
  initialItems: StoryRow[];
  initialNextCursor: FeedCursor | null;
  initialHasMore: boolean;
};

export default function SpaceStoriesList({
  spaceSlug,
  viewerId,
  initialItems,
  initialNextCursor,
  initialHasMore,
}: SpaceStoriesListProps) {
  const loadMoreFn = useCallback(
    (cursor: FeedCursor) => loadMoreSpaceStories(spaceSlug, cursor),
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
        Nessuna storia, ancora. Vuoi raccontare la tua?
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {items.map((s) => (
          <StoryListItem key={s.id} story={s} viewerId={viewerId} />
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
