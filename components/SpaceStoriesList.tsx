"use client";

import { useCallback } from "react";
import AtRiskBanner from "@/components/AtRiskBanner";
import { AvatarImage } from "@/components/AvatarImage";
import ReportButton from "@/components/ReportButton";
import StoryReactionButton from "@/components/StoryReactionButton";
import BreakReminderBanner from "@/components/infinite-scroll/BreakReminderBanner";
import InfiniteListFooter from "@/components/infinite-scroll/InfiniteListFooter";
import { usePaginatedFeed } from "@/components/infinite-scroll/usePaginatedFeed";
import { loadMoreSpaceStories } from "@/lib/feed-actions";
import type { StoryRow } from "@/lib/space-content";
import type { FeedCursor } from "@/lib/pagination";
import { timeAgo } from "@/lib/time";

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
          <li key={s.id} className="card p-5">
            {s.at_risk && s.author_id === viewerId && <AtRiskBanner />}
            <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3">
              <AvatarImage src={s.avatarSrc} nickname={s.nickname} size={32} />
              <span className="font-medium text-petrolio">@{s.nickname}</span>
              <span aria-hidden>·</span>
              <time dateTime={s.created_at}>{timeAgo(s.created_at)}</time>
              <ReportButton
                targetType="story"
                targetId={s.id}
                className="ml-auto shrink-0"
              />
            </header>
            {s.title && (
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
            )}
            <p className="text-[15px] text-petrolio leading-relaxed whitespace-pre-wrap">
              {s.content}
            </p>
            <footer className="mt-4">
              <StoryReactionButton
                storyId={s.id}
                initialCount={s.reaction_count}
                initialActive={s.has_reacted}
              />
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
