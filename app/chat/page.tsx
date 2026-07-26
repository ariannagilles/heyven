import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import MentorProfileCard from "@/components/MentorProfileCard";
import StartChatButton from "./StartChatButton";
import { createClient } from "@/lib/supabase/server";
import {
  getAssignedMentorProfile,
  getProfile,
  getUserConversation,
} from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chat");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role === "mentor") redirect("/mentor");
  if (profile?.role === "admin") redirect("/admin");

  const conversation = await getUserConversation(supabase, user.id);

  if (conversation) {
    const mentorProfile = await getAssignedMentorProfile(supabase);
    console.log("MENTOR PROFILE su /chat:", JSON.stringify(mentorProfile));
    if (!mentorProfile) redirect("/chat/c");

    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-8 space-y-5">
          {mentorProfile.match_type === "experience" ? (
            <>
              <h1 className="text-xl font-semibold">
                Abbiamo pensato a @{mentorProfile.nickname} per te
              </h1>
              <p className="text-sm text-cream/70 leading-relaxed">
                Ha attraversato qualcosa di simile a quello che stai vivendo. Non
                sei solo a conoscerlo.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">
                Ti presentiamo @{mentorProfile.nickname}
              </h1>
              <p className="text-sm text-cream/70 leading-relaxed">
                Una persona reale, pronta ad ascoltarti quando vuoi.
              </p>
            </>
          )}

          <div className="inline-flex items-center gap-2 rounded-full bg-petrolio text-crema px-4 py-2 text-sm font-medium">
            <span aria-hidden>✦</span>
            Il tuo Mentore è una persona reale, non un&apos;AI
          </div>

          <MentorProfileCard profile={mentorProfile} />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md flex-col items-center justify-center px-6 text-center">
        <svg
          width="180"
          height="140"
          viewBox="0 0 180 140"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-8"
          aria-hidden
        >
          <ellipse cx="90" cy="125" rx="70" ry="8" fill="#04342C" opacity="0.06" />
          <circle cx="62" cy="42" r="18" fill="#0F6E56" />
          <path d="M32 108 Q32 72 62 72 Q92 72 92 108 Z" fill="#0F6E56" />
          <circle cx="118" cy="42" r="18" fill="#04342C" />
          <path d="M88 108 Q88 72 118 72 Q148 72 148 108 Z" fill="#04342C" />
          <circle cx="90" cy="60" r="10" fill="#FAC775" />
          <path
            d="M90 64 L86 59 Q86 56 88.5 56 Q90 56 90 58 Q90 56 91.5 56 Q94 56 94 59 Z"
            fill="#04342C"
          />
        </svg>

        <h1 className="text-2xl font-semibold text-cream">Il tuo Mentore ti aspetta</h1>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-cream/70">
          Cercheremo tra i nostri Mentori la persona più adatta a quello che stai vivendo.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/5 px-3 py-1.5 text-xs text-cream/70">
            <span aria-hidden>✦</span> Una persona reale, non un&apos;AI
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/5 px-3 py-1.5 text-xs text-cream/70">
            <span aria-hidden>⏱</span> Risponde entro 24 ore
          </span>
        </div>

        <div className="mt-8 flex w-full justify-center">
          <StartChatButton />
        </div>
      </main>
    </>
  );
}
