import Link from "next/link";
import MentorMeetingAvatar from "./MentorMeetingAvatar";
import ActivateMentorButton from "./ActivateMentorButton";
import { experienceAreaLabels } from "@/lib/mentor-display";

export type MentorMeetingData = {
  nickname: string;
  intro_text: string;
  experience_areas: string[];
  months_here: number;
  people_accompanied: number;
};

type Props = {
  mode: "preview" | "active";
  mentor: MentorMeetingData;
};

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cream/55">
      {children}
    </p>
  );
}

function Signal({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="min-w-0 text-center">
      <p className="font-display text-[22px] leading-none text-cream">{value}</p>
      <p className="mt-1.5 text-[11px] leading-snug text-cream/50">{label}</p>
    </div>
  );
}

export default function MentorMeetingView({ mode, mentor }: Props) {
  const areas = experienceAreaLabels(mentor.experience_areas);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-24 pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col space-y-4 pb-36">
        <header className="flex flex-col items-center text-center">
          <MentorMeetingAvatar nickname={mentor.nickname} />
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-mint">
            Il tuo Mentore
          </p>
          <h1 className="font-display mt-1.5 text-[20px] leading-tight text-cream">
            @{mentor.nickname}
          </h1>
        </header>

        <section className="glass-card p-4">
          <BlockLabel>Chi sono</BlockLabel>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-cream/85 whitespace-pre-wrap">
            {mentor.intro_text}
          </p>
        </section>

        {areas.length > 0 && (
          <section className="glass-card p-4">
            <BlockLabel>Aree di esperienza</BlockLabel>
            <div className="mt-3 flex flex-wrap gap-2">
              {areas.map((name) => (
                <span
                  key={name}
                  className="rounded-[14px] border border-mint/30 bg-mint/10 px-2.5 py-1 text-[12px] text-mint"
                >
                  {name}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="glass-card p-4">
          <div className="grid grid-cols-3 gap-3">
            <Signal value={mentor.months_here} label="mesi qui" />
            <Signal
              value={mentor.people_accompanied}
              label="persone accompagnate"
            />
            <Signal value="☾" label="supervisionato" />
          </div>
        </section>
      </div>

      <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-4">
        <div className="mx-auto max-w-2xl">
          {mode === "preview" ? (
            <ActivateMentorButton />
          ) : (
            <Link
              href="/chat/c"
              className="block w-full rounded-full bg-cream py-3.5 text-center text-[15px] font-semibold text-petrolio transition-transform active:scale-[0.98]"
            >
              Inizia la conversazione
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
