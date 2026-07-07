export const PAGE_SIZE = 20;

export type FeedCursor = {
  created_at: string;
  id: string;
};

export type PageOpts = {
  limit?: number;
  cursor?: FeedCursor | null;
};

export type PageResult<T> = {
  items: T[];
  nextCursor: FeedCursor | null;
  hasMore: boolean;
};

export const EMPTY_PAGE = <T>(): PageResult<T> => ({
  items: [],
  nextCursor: null,
  hasMore: false,
});

export function pageFromRows<T extends { created_at: string; id: string }>(
  rows: T[],
  limit: number,
): PageResult<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return {
    items,
    nextCursor: last ? { created_at: last.created_at, id: last.id } : null,
    hasMore,
  };
}

export function applyFeedCursor<
  Q extends { or: (filters: string) => Q },
>(query: Q, cursor: FeedCursor | null | undefined): Q {
  if (!cursor) return query;
  return query.or(
    `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
  );
}

export function compareFeedItems<T extends { created_at: string; id: string }>(
  a: T,
  b: T,
): number {
  if (a.created_at !== b.created_at) {
    return a.created_at < b.created_at ? 1 : -1;
  }
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}
