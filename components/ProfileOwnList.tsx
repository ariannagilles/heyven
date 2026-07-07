"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import BreakReminderBanner from "@/components/infinite-scroll/BreakReminderBanner";
import InfiniteListFooter from "@/components/infinite-scroll/InfiniteListFooter";
import { useInfiniteScroll } from "@/components/infinite-scroll/useInfiniteScroll";
import {
  loadMoreOwnPosts,
  loadMoreOwnQuestions,
  loadMoreOwnStories,
} from "@/lib/feed-actions";
import type { FeedCursor } from "@/lib/pagination";
import type {
  OwnPostRow,
  OwnQuestionRow,
  OwnStoryRow,
} from "@/lib/profile";
import { SPACE_BY_SLUG } from "@/lib/spaces";
import { timeAgo } from "@/lib/time";

export type ProfileTab = "sfoghi" | "domande" | "storie";

export type ProfileListItem = {
  id: string;
  href: string;
  spaceSlug: string;
  created_at: string;
  snippet: string;
  interactions: string;
};

export function mapOwnPost(p: OwnPostRow): ProfileListItem {
  return {
    id: p.id,
    href: `/post/${p.id}`,
    spaceSlug: p.space_slug,
    created_at: p.created_at,
    snippet: p.content,
    interactions: `${p.me_too_count} anch'io · ${p.reply_count} rispost${p.reply_count === 1 ? "a" : "e"}`,
  };
}

export function mapOwnQuestion(q: OwnQuestionRow): ProfileListItem {
  return {
    id: q.id,
    href: `/spazi/${q.space_slug}/domande/${q.id}`,
    spaceSlug: q.space_slug,
    created_at: q.created_at,
    snippet: q.content,
    interactions: `${q.reply_count} rispost${q.reply_count === 1 ? "a" : "e"}`,
  };
}

export function mapOwnStory(s: OwnStoryRow): ProfileListItem {
  return {
    id: s.id,
    href: `/spazi/${s.space_slug}/storie`,
    spaceSlug: s.space_slug,
    created_at: s.created_at,
    snippet: s.title || s.content,
    interactions: `${s.reaction_count} anch'io`,
  };
}

type ProfileOwnListProps = {
  tab: ProfileTab;
  empty: string;
  initialItems: ProfileListItem[];
  initialNextCursor: FeedCursor | null;
  initialHasMore: boolean;
};

export default function ProfileOwnList({
  tab,
  empty,
  initialItems,
  initialNextCursor,
  initialHasMore,
}: ProfileOwnListProps) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) return;

    setIsLoading(true);
    try {
      const result =
        tab === "sfoghi"
          ? await loadMoreOwnPosts(cursor)
          : tab === "domande"
            ? await loadMoreOwnQuestions(cursor)
            : await loadMoreOwnStories(cursor);

      const mapped =
        tab === "sfoghi"
          ? result.items.map((row) => mapOwnPost(row as OwnPostRow))
          : tab === "domande"
            ? result.items.map((row) => mapOwnQuestion(row as OwnQuestionRow))
            : result.items.map((row) => mapOwnStory(row as OwnStoryRow));

      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const fresh = mapped.filter((item) => !seen.has(item.id));
        return [...prev, ...fresh];
      });
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, hasMore, isLoading, tab]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center text-petrolio/70">{empty}</div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {items.map((item) => {
          const space = SPACE_BY_SLUG[item.spaceSlug];
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="card block p-4 hover:bg-white transition"
              >
                <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-2 flex-wrap">
                  <span className="chip">
                    {space?.emoji} {space?.name ?? item.spaceSlug}
                  </span>
                  <span aria-hidden>·</span>
                  <time dateTime={item.created_at}>{timeAgo(item.created_at)}</time>
                </header>
                <p className="text-petrolio leading-relaxed line-clamp-3">
                  {item.snippet}
                </p>
                <p className="text-xs text-petrolio/60 mt-2">{item.interactions}</p>
              </Link>
            </li>
          );
        })}
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
