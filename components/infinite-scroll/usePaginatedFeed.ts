"use client";

import { useCallback, useState } from "react";
import { useInfiniteScroll } from "./useInfiniteScroll";
import type { FeedCursor } from "@/lib/pagination";

export type PageLoadResult<T, C> = {
  items: T[];
  nextCursor: C | null;
  hasMore: boolean;
};

type UsePaginatedFeedOptions<T, C> = {
  initialItems: T[];
  initialNextCursor: C | null;
  initialHasMore: boolean;
  loadMore: (cursor: C) => Promise<PageLoadResult<T, C>>;
  getItemKey?: (item: T) => string;
};

export function usePaginatedFeed<T, C = FeedCursor>({
  initialItems,
  initialNextCursor,
  initialHasMore,
  loadMore: loadMoreFn,
  getItemKey = (item) => (item as { id: string }).id,
}: UsePaginatedFeedOptions<T, C>) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || cursor == null) return;

    setIsLoading(true);
    try {
      const result = await loadMoreFn(cursor);
      setItems((prev) => {
        const seen = new Set(prev.map(getItemKey));
        const fresh = result.items.filter((item) => !seen.has(getItemKey(item)));
        return [...prev, ...fresh];
      });
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, getItemKey, hasMore, isLoading, loadMoreFn]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  return { items, isLoading, hasMore, sentinelRef };
}
