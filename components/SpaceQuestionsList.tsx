"use client";

import { useCallback } from "react";
import Link from "next/link";
import { AvatarImage } from "@/components/AvatarImage";
import ReportButton from "@/components/ReportButton";
import BreakReminderBanner from "@/components/infinite-scroll/BreakReminderBanner";
import InfiniteListFooter from "@/components/infinite-scroll/InfiniteListFooter";
import { usePaginatedFeed } from "@/components/infinite-scroll/usePaginatedFeed";
import { loadMoreSpaceQuestions } from "@/lib/feed-actions";
import type { QuestionRow } from "@/lib/space-content";
import type { FeedCursor } from "@/lib/pagination";
import { timeAgo } from "@/lib/time";

type SpaceQuestionsListProps = {
  spaceSlug: string;
  initialItems: QuestionRow[];
  initialNextCursor: FeedCursor | null;
  initialHasMore: boolean;
};

export default function SpaceQuestionsList({
  spaceSlug,
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
          <li key={q.id} className="card p-4">
            <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-2">
              <AvatarImage src={q.avatarSrc} nickname={q.nickname} size={28} />
              <span className="font-medium text-petrolio">@{q.nickname}</span>
              <span aria-hidden>·</span>
              <time dateTime={q.created_at}>{timeAgo(q.created_at)}</time>
              <ReportButton
                targetType="question"
                targetId={q.id}
                className="ml-auto shrink-0"
              />
            </header>
            <p className="text-petrolio leading-relaxed whitespace-pre-wrap">
              {q.content}
            </p>
            <footer className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm text-petrolio/70">
                {q.reply_count} rispost{q.reply_count === 1 ? "a" : "e"}
              </span>
              <Link
                href={`/spazi/${spaceSlug}/domande/${q.id}`}
                className="btn-outline text-sm"
              >
                Rispondi
              </Link>
            </footer>
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
