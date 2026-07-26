"use client";

import {
  SPACE_FEED_FILTERS,
  type SpaceFeedFilter,
} from "@/lib/space-feed";

type Props = {
  value: SpaceFeedFilter;
  onChange: (filter: SpaceFeedFilter) => void;
  disabled?: boolean;
};

export default function SpaceFormatFilter({ value, onChange, disabled }: Props) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {SPACE_FEED_FILTERS.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            className={
              "rounded-full px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 " +
              (active
                ? "border border-mint/40 bg-mint/15 text-mint"
                : "border border-transparent bg-cream/5 text-cream/55 hover:bg-cream/10")
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
