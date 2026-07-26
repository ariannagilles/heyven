type Props = {
  /** Optional mood values (newest last) to shape the wave evocatively. */
  points?: number[] | null;
};

/** Soft decorative wave — no grid, numbers, or scores. */
export default function ProfilePathWave({ points }: Props) {
  const hasData = points && points.length >= 2;

  const path = hasData
    ? buildWaveFromPoints(points)
    : "M 4 52 C 28 38, 52 66, 76 48 S 124 28, 148 44 S 196 62, 220 36 S 268 24, 292 40";

  return (
    <div className="relative h-[72px] w-full overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 296 72"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="profile-wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(93, 202, 165, 0.22)" />
            <stop offset="100%" stopColor="rgba(93, 202, 165, 0)" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L 292 72 L 4 72 Z`}
          fill="url(#profile-wave-fill)"
        />
        <path
          d={path}
          fill="none"
          stroke="rgba(93, 202, 165, 0.55)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function buildWaveFromPoints(values: number[]): string {
  const width = 296;
  const height = 72;
  const padding = 12;
  const step = (width - padding * 2) / (values.length - 1);

  const coords = values.map((v, i) => {
    const x = padding + i * step;
    const y = padding + (1 - clamp(v, 0, 1)) * (height - padding * 2);
    return { x, y };
  });

  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cx = (prev.x + curr.x) / 2;
    d += ` C ${cx.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
