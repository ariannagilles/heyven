"use client";

import { SPACES } from "@/lib/spaces";

export default function SpaceSelector({
  value,
  onChange,
  label = "Spazio tematico",
}: {
  value: string;
  onChange: (slug: string) => void;
  label?: string;
}) {
  return (
    <div>
      <span className="text-xs font-medium text-petrolio/70 block mb-2">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {SPACES.map((s) => {
          const active = s.slug === value;
          return (
            <button
              key={s.slug}
              type="button"
              onClick={() => onChange(s.slug)}
              aria-pressed={active}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition " +
                (active
                  ? "bg-petrolio text-crema"
                  : "bg-petrolio/5 text-petrolio hover:bg-petrolio/10")
              }
            >
              <span aria-hidden>{s.emoji}</span>
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
