import Link from "next/link";
import Avatar from "./Avatar";
import Stars from "./Stars";
import type { AssignedMentorProfile } from "@/lib/chat";

export default function MentorProfileCard({
  profile,
}: {
  profile: AssignedMentorProfile;
}) {
  return (
    <article className="card p-6">
      <div className="flex items-start gap-4">
        <Avatar nickname={profile.nickname} size={64} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h2 className="text-lg font-semibold">@{profile.nickname}</h2>
            <span className="text-xs text-petrolio/50 shrink-0">
              il tuo mentore
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-sm text-petrolio/70 flex-wrap">
            <Stars value={profile.avg_rating} size="sm" />
            {profile.ratings_count > 0 ? (
              <span className="tabular-nums">
                {profile.avg_rating.toFixed(2)}{" "}
                <span className="text-petrolio/50">
                  ({profile.ratings_count})
                </span>
              </span>
            ) : (
              <span className="text-petrolio/50">nessuna valutazione</span>
            )}
            <span aria-hidden>·</span>
            <span>
              {profile.completed_conversations} conversazion
              {profile.completed_conversations === 1 ? "e" : "i"} completate
            </span>
          </div>
        </div>
      </div>

      <p className="text-[15px] text-petrolio/80 mt-4 whitespace-pre-wrap italic leading-relaxed">
        “{profile.intro_text}”
      </p>

      <Link href="/chat/c" className="btn-primary w-full mt-5 sm:w-auto sm:inline-flex">
        Inizia la chat
      </Link>
    </article>
  );
}
