"use client";

type InfiniteListFooterProps = {
  isLoading: boolean;
  hasMore: boolean;
  itemCount: number;
};

export default function InfiniteListFooter({
  isLoading,
  hasMore,
  itemCount,
}: InfiniteListFooterProps) {
  if (itemCount === 0) return null;

  if (isLoading) {
    return (
      <p className="py-6 text-center text-sm text-petrolio/60" aria-live="polite">
        Caricamento…
      </p>
    );
  }

  if (!hasMore) {
    return (
      <p className="py-6 text-center text-sm text-petrolio/50" aria-live="polite">
        Hai visto tutto
      </p>
    );
  }

  return null;
}
