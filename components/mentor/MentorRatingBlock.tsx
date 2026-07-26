import {
  MIN_MENTOR_RATINGS_DISPLAY,
  mentorRatingColor,
  starFillForIndex,
  type MentorRatingSummary,
} from "@/lib/mentor-rating";

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cream/55">
      {children}
    </p>
  );
}

function FractionalStar({
  fill,
  color,
}: {
  fill: number;
  color: string;
}) {
  return (
    <span className="relative inline-block text-[22px] leading-none">
      <span className="text-cream/18" aria-hidden>
        ★
      </span>
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fill * 100}%` }}
        aria-hidden
      >
        <span style={{ color }}>★</span>
      </span>
    </span>
  );
}

export default function MentorRatingBlock({
  summary,
}: {
  summary: MentorRatingSummary;
}) {
  const showAverage = summary.count >= MIN_MENTOR_RATINGS_DISPLAY;
  const color = mentorRatingColor(summary.avg);

  return (
    <section className="glass-card p-4">
      <BlockLabel>Valutazione</BlockLabel>
      {showAverage ? (
        <div className="mt-3 flex items-center justify-between gap-4">
          <p
            className="font-display text-[34px] leading-none tabular-nums"
            style={{ color }}
          >
            {summary.avg.toFixed(1)}
          </p>
          <div className="min-w-0 text-right">
            <div className="flex justify-end gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <FractionalStar
                  key={i}
                  fill={starFillForIndex(summary.avg, i)}
                  color={color}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-cream/50">
              da {summary.count} conversazion{summary.count === 1 ? "e" : "i"}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[13.5px] leading-[1.5] text-cream/55">
          Ancora poche valutazioni
        </p>
      )}
    </section>
  );
}
