import Link from "next/link";
import type { ReactNode } from "react";
import MentorMeetingAvatar from "@/components/mentor/MentorMeetingAvatar";
import type { HomeMentorCardState } from "@/lib/chat";

const AVATAR_GRADIENT = "linear-gradient(145deg, #1D9E75 0%, #0B3F34 100%)";

function PlaceholderAvatar() {
  return (
    <div
      aria-hidden
      className="h-[42px] w-[42px] shrink-0 rounded-xl"
      style={{ background: AVATAR_GRADIENT }}
    />
  );
}

function CardLabel() {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cream/60">
      Il tuo Mentore
    </p>
  );
}

function CardButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-full bg-cream px-4 py-2 text-center text-sm font-medium text-petrolio transition-transform active:scale-[0.98]"
    >
      {children}
    </Link>
  );
}

export default function HomeMentorCard({
  state,
}: {
  state: HomeMentorCardState;
}) {
  if (state.status === "loading") {
    return (
      <div
        className="glass-card flex items-center gap-3 p-4"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="h-[42px] w-[42px] shrink-0 animate-pulse rounded-xl bg-cream/10" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-2.5 w-20 animate-pulse rounded bg-cream/10" />
          <div className="h-3.5 w-40 animate-pulse rounded bg-cream/10" />
        </div>
      </div>
    );
  }

  if (state.status === "idle") {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <PlaceholderAvatar />
          <div className="min-w-0 flex-1">
            <CardLabel />
            <p className="text-sm text-cream">
              Quando vuoi, qui c&apos;è qualcuno che ti ascolta.
            </p>
          </div>
        </div>
        <Link
          href="/chat/incontro"
          className="mt-3 block rounded-full bg-cream px-4 py-2.5 text-center text-sm font-medium text-petrolio transition-transform active:scale-[0.98]"
        >
          Parla con un Mentore
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card flex items-center gap-3 p-4">
      <MentorMeetingAvatar nickname={state.mentorNickname} size={42} />
      <div className="min-w-0 flex-1">
        <CardLabel />
        <p className="truncate text-sm text-cream">
          {state.lastMessage ?? "Ci sono, quando vuoi."}
        </p>
        <p className="mt-0.5 text-[12px] text-cream/55">{state.presenceLabel}</p>
      </div>
      <CardButton href={`/chat/c/${state.conversationId}`}>Continua</CardButton>
    </div>
  );
}
