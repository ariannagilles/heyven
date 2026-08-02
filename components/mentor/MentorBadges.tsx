type BadgeState = {
  active?: boolean;
  median_hours?: number;
  sample_count?: number;
};

export type MentorBadgesPayload = Record<string, BadgeState | undefined> | null;

const BADGE_DEFS = [
  {
    key: "sentinella",
    name: "Sentinella",
    activeDesc: "Vegli su chi ti scrive. Rispondi con costanza.",
    lockedDesc: "Rispondi con costanza a chi ti scrive per ottenerlo.",
  },
] as const;

function SentinellaShieldIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg
        viewBox="0 0 120 148"
        width={72}
        height={88}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M60 8 L104 24 L104 70 Q104 116 60 140 Q16 116 16 70 L16 24 Z"
          fill="rgba(93,202,165,0.14)"
          stroke="#5DCAA5"
          strokeWidth={2}
        />
        <path
          d="M36 74 Q60 52 84 74 Q60 96 36 74 Z"
          fill="none"
          stroke="#5DCAA5"
          strokeWidth={2.2}
        />
        <circle cx={60} cy={74} r={9} fill="#5DCAA5" />
        <circle cx={63} cy={71} r={2.4} fill="#0a2b25" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 120 148"
      width={72}
      height={88}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="shrink-0 opacity-50"
    >
      <path
        d="M60 8 L104 24 L104 70 Q104 116 60 140 Q16 116 16 70 L16 24 Z"
        fill="rgba(245,239,227,0.04)"
        stroke="rgba(245,239,227,0.4)"
        strokeWidth={2}
      />
      <path
        d="M36 74 Q60 52 84 74 Q60 96 36 74 Z"
        fill="none"
        stroke="rgba(245,239,227,0.4)"
        strokeWidth={2.2}
      />
      <circle cx={60} cy={74} r={9} fill="rgba(245,239,227,0.4)" />
    </svg>
  );
}

function badgeIcon(key: string, active: boolean) {
  if (key === "sentinella") {
    return <SentinellaShieldIcon active={active} />;
  }
  return null;
}

export default function MentorBadges({ badges }: { badges: MentorBadgesPayload }) {
  return (
    <section className="space-y-3">
      <div className="space-y-1 px-1">
        <h2 className="text-sm font-medium text-cream/70">I tuoi riconoscimenti</h2>
        <p className="text-[14px] leading-relaxed text-cream/60">
          I riconoscimenti raccontano come ci sei per gli altri. Compaiono quando te li guadagni e
          restano finché continui.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BADGE_DEFS.map((def) => {
          const active = badges?.[def.key]?.active === true;
          return (
            <article
              key={def.key}
              className="card flex flex-col items-center p-5 text-center sm:items-center"
            >
              <div className="mb-3 flex justify-center">{badgeIcon(def.key, active)}</div>
              <h3
                className={
                  "font-display text-[18px] leading-tight " +
                  (active ? "text-cream" : "text-cream/[0.55]")
                }
              >
                {def.name}
              </h3>
              <p
                className={
                  "mt-2 text-sm leading-relaxed " +
                  (active ? "text-cream/60" : "text-cream/[0.45]")
                }
              >
                {active ? def.activeDesc : def.lockedDesc}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
