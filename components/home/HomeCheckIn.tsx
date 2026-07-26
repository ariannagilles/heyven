"use client";

const MOODS = ["un peso", "così così", "un respiro"] as const;

export default function HomeCheckIn() {
  return (
    <div className="glass-card p-4">
      <p className="mb-3 text-sm text-cream/75">Un gesto, senza numeri.</p>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((mood) => (
          <button
            key={mood}
            type="button"
            className="rounded-full border border-cream/15 bg-cream/5 px-4 py-2 text-sm text-cream/85 transition-colors hover:bg-cream/10"
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
}
