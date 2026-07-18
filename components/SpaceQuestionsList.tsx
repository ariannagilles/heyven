"use client";

import { useCallback } from "react";
import QuestionListItem from "@/components/QuestionListItem";
import BreakReminderBanner from "@/components/infinite-scroll/BreakReminderBanner";
import InfiniteListFooter from "@/components/infinite-scroll/InfiniteListFooter";
import { usePaginatedFeed } from "@/components/infinite-scroll/usePaginatedFeed";
import { loadMoreSpaceQuestions } from "@/lib/feed-actions";
import type { QuestionRow } from "@/lib/space-content";
import type { FeedCursor } from "@/lib/pagination";

type SpaceQuestionsListProps = {
  spaceSlug: string;
  viewerId: string;
  initialItems: QuestionRow[];
  initialNextCursor: FeedCursor | null;
  initialHasMore: boolean;
};

export default function SpaceQuestionsList({
  spaceSlug,
  viewerId,
  initialItems,
  initialNextCursor,
  initialHasMore,
}: SpaceQuestionsListProps) {
  const loadMoreFn = useCallback(
    (cursor: FeedCursor) => loadMoreSpaceQuestions(spaceSlug, cursor),
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
        Nessuna domanda. Sii la prima persona a chiedere.
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {items.map((q) => (
          <QuestionListItem
            key={q.id}
            question={q}
            spaceSlug={spaceSlug}
            viewerId={viewerId}
          />
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
