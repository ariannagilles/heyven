import Link from "next/link";
import Avatar from "./Avatar";
import type { AssignedMentorProfile } from "@/lib/chat";
import { SPACES } from "@/lib/spaces";

export default function MentorProfileCard({
  profile,
}: {
  profile: AssignedMentorProfile;
}) {
  const areas = (profile.experience_areas ?? [])
    .map((slug) => SPACES.find((s) => s.slug === slug))
    .filter(Boolean) as { slug: string; name: string; emoji: string }[];

  return (
    <div className="space-y-3">
      <article className="card p-5">
        <div className="flex items-center gap-4">
          <Avatar nickname={profile.nickname} size={56} />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-cream">@{profile.nickname}</h2>
            <p className="text-xs text-cream/50">il tuo mentore</p>
          </div>
        </div>
        <p className="text-[15px] text-cream/80 mt-4 whitespace-pre-wrap italic leading-relaxed">
          &ldquo;{profile.intro_text}&rdquo;
        </p>
      </article>

      {areas.length > 0 && (
        <article className="card p-5">
          <div className="text-xs font-semibold text-cream/50 uppercase tracking-wide mb-3">
            Di cosa si occupa
          </div>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <span
                key={a.slug}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm bg-cream/5 text-cream"
              >
                <span aria-hidden>{a.emoji}</span>
                {a.name}
              </span>
            ))}
          </div>
        </article>
      )}

      <article className="card p-5 space-y-3">
        <div className="flex items-center gap-3 text-sm text-cream/80">
          <span aria-hidden>🤝</span>
          <span>
            Ha accompagnato{" "}
            <b className="text-cream font-semibold">
              {profile.completed_conversations}{" "}
              {profile.completed_conversations === 1 ? "persona" : "persone"}
            </b>
          </span>
        </div>
        {profile.ratings_count > 0 && (
          <div className="flex items-center gap-3 text-sm text-cream/80">
            <span aria-hidden>💚</span>
            <span>
              Valutazione media{" "}
              <b className="text-cream font-semibold tabular-nums">
                {profile.avg_rating.toFixed(1)}
              </b>{" "}
              <span className="text-cream/50">su {profile.ratings_count}</span>
            </span>
          </div>
        )}
      </article>

      <Link href="/chat/c" className="btn-primary w-full text-center">
        Scrivi al tuo Mentore
      </Link>
    </div>
  );
}
