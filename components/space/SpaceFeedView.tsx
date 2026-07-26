"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import SpaceFeedCard from "@/components/space/SpaceFeedCard";
import SpaceFeedEmpty from "@/components/space/SpaceFeedEmpty";
import SpaceFormatFilter from "@/components/space/SpaceFormatFilter";
import BreakReminderBanner from "@/components/infinite-scroll/BreakReminderBanner";
import InfiniteListFooter from "@/components/infinite-scroll/InfiniteListFooter";
import { useInfiniteScroll } from "@/components/infinite-scroll/useInfiniteScroll";
import {
  fetchSpaceFeedInitial,
  loadMoreSpaceFeed,
} from "@/lib/feed-actions";
import type { MixedFeedItem } from "@/lib/unified-feed";
import {
  type SpaceFeedFilter,
  type SpaceFeedPage,
} from "@/lib/space-feed";

type Props = {
  spaceSlug: string;
  initialFilter: SpaceFeedFilter;
  initialPage: SpaceFeedPage;
};

export default function SpaceFeedView({
  spaceSlug,
  initialFilter,
  initialPage,
}: Props) {
  const [filter, setFilter] = useState(initialFilter);
  const [items, setItems] = useState<MixedFeedItem[]>(initialPage.items);
  const [cursor, setCursor] = useState<SpaceFeedPage["nextCursor"]>(
    initialPage.nextCursor,
  );
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || cursor == null) return;

    setIsLoading(true);
    try {
      const result = await loadMoreSpaceFeed(spaceSlug, filter, cursor);
      setItems((prev) => {
        const seen = new Set(prev.map((item) => `${item.kind}-${item.id}`));
        const fresh = result.items.filter(
          (item) => !seen.has(`${item.kind}-${item.id}`),
        );
        return [...prev, ...fresh];
      });
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, filter, hasMore, isLoading, spaceSlug]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  const handleFilterChange = (next: SpaceFeedFilter) => {
    if (next === filter || isPending) return;

    startTransition(() => {
      void fetchSpaceFeedInitial(spaceSlug, next).then((result) => {
        setFilter(next);
        setItems(result.items);
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
      });
    });
  };

  useEffect(() => {
    setFilter(initialFilter);
    setItems(initialPage.items);
    setCursor(initialPage.nextCursor);
    setHasMore(initialPage.hasMore);
  }, [initialFilter, initialPage]);

  const busy = isLoading || isPending;

  return (
    <>
      <SpaceFormatFilter
        value={filter}
        onChange={handleFilterChange}
        disabled={isPending}
      />

      {items.length === 0 ? (
        <SpaceFeedEmpty spaceSlug={spaceSlug} filter={filter} />
      ) : (
        <ul>
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <SpaceFeedCard item={item} />
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-1" aria-hidden />

      <InfiniteListFooter
        isLoading={busy}
        hasMore={hasMore}
        itemCount={items.length}
      />

      <BreakReminderBanner />
    </>
  );
}
