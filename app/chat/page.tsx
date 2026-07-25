import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
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
              <p className="text-sm text-petrolio/70 leading-relaxed">
                Ha attraversato qualcosa di simile a quello che stai vivendo. Non
                sei solo a conoscerlo.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold">
                Ti presentiamo @{mentorProfile.nickname}
              </h1>
              <p className="text-sm text-petrolio/70 leading-relaxed">
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
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-5">
        <h1 className="text-xl font-semibold">Chat con un mentore</h1>

        <div className="inline-flex items-center gap-2 rounded-full bg-petrolio text-crema px-4 py-2 text-sm font-medium">
          <span aria-hidden>✦</span>
          Il tuo Mentore è una persona reale, non un&apos;AI
        </div>

        <p className="text-sm text-petrolio/70 leading-relaxed">
          Risponde entro 24 ore.
          <br />
          Puoi scrivere quando vuoi.
        </p>

        <article className="card p-6">
          <div className="flex items-start gap-4">
            <Avatar nickname="placeholder-mentor" size={64} />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] text-petrolio/80 italic leading-relaxed">
                Stiamo trovando il Mentore più adatto a te.
              </p>
            </div>
          </div>
        </article>

        <div className="space-y-2">
          <StartChatButton />
          <p className="text-xs text-petrolio/60">
            Troveremo il Mentore più adatto a te.
          </p>
        </div>
      </main>
    </>
  );
}
