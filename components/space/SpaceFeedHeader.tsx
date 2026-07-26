import Link from "next/link";

type Props = {
  spaceName: string;
  peopleToday: number;
};

export default function SpaceFeedHeader({ spaceName, peopleToday }: Props) {
  return (
    <header className="mb-4 flex items-center gap-3">
      <Link
        href="/spazi"
        aria-label="Torna agli spazi"
        className="glass-card flex h-[34px] w-[34px] shrink-0 items-center justify-center text-lg leading-none text-cream/80 transition-transform active:scale-[0.98]"
      >
        ‹
      </Link>
      <div className="min-w-0">
        <h1 className="font-display text-[17px] leading-tight text-cream">{spaceName}</h1>
        <p className="text-[11.5px] text-cream/60 tabular-nums">
          {peopleToday} {peopleToday === 1 ? "persona" : "persone"} qui oggi
        </p>
      </div>
    </header>
  );
}
