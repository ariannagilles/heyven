import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import ProfileSubpageHeader from "@/components/profile/ProfileSubpageHeader";
import IntroEditor from "./IntroEditor";
import ExperienceAreasEditor from "./ExperienceAreasEditor";
import MentorSettingsEditor from "./MentorSettingsEditor";
import MentorRatingBlock from "@/components/mentor/MentorRatingBlock";
import MentorBadges, { type MentorBadgesPayload } from "@/components/mentor/MentorBadges";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getMentorChats, getMentorRatingsSummary } from "@/lib/chat";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function MentorDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mentor");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "mentor") redirect("/");

  const [{ data: mentorRow }, chats, ratings, { data: badges }] = await Promise.all([
    supabase
      .from("mentors")
      .select(
        "is_available, active_users_count, intro_text, experience_areas, max_active_conversations"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    getMentorChats(supabase),
    getMentorRatingsSummary(supabase, user.id),
    supabase.rpc("get_mentor_badges", { p_mentor_id: user.id }),
  ]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <ProfileSubpageHeader title="Dashboard Mentore" />
        <header className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar nickname={profile.nickname} size={48} />
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">
                  @{profile.nickname}
                </h1>
                <p className="text-sm text-cream/70">
                  Dashboard mentore · {chats.length} chat
                </p>
              </div>
            </div>
            <span
              className={
                "chip shrink-0 " +
                (mentorRow?.is_available ? "text-cream" : "text-cream/50")
              }
            >
              {mentorRow?.is_available ? "disponibile" : "non disponibile"}
            </span>
          </div>
        </header>

        <section className="card p-5 space-y-3">
          <IntroEditor
            mentorId={user.id}
            initial={mentorRow?.intro_text ?? ""}
            title="La tua presentazione"
            description="Questa frase appare nel tuo profilo prima che l'utente apra la chat."
          />
        </section>

        <section className="card p-5 space-y-3">
          <ExperienceAreasEditor
            initial={mentorRow?.experience_areas ?? []}
            title="Di cosa ti occupi"
            description="Scegli fino a 4 aree che hai attraversato in prima persona. Ci aiutano a farti incontrare le persone che vivono qualcosa di simile."
          />
        </section>

        <section className="card p-5 space-y-3">
          <h2 className="text-sm font-medium text-cream/70">Le tue impostazioni</h2>
          <MentorSettingsEditor
            initialMaxActiveConversations={mentorRow?.max_active_conversations ?? 3}
            initialIsAvailable={mentorRow?.is_available ?? true}
          />
        </section>

        <RatingsSection summary={ratings} />

        <MentorBadges badges={(badges as MentorBadgesPayload) ?? null} />

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-cream/70 px-1">
            Le tue chat
          </h2>
          {chats.length === 0 ? (
            <div className="card p-8 text-center text-cream/70">
              Ancora nessuna chat assegnata.
            </div>
          ) : (
            <ul className="space-y-3">
              {chats.map((c) => (
                <li key={c.conversation_id}>
                  <Link
                    href={`/mentor/c/${c.conversation_id}`}
                    className="card block p-4 hover:bg-cream/5 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar nickname={c.user_nickname} size={40} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">@{c.user_nickname}</span>
                            {c.status === "closed" && (
                              <span className="chip text-cream/60">chiusa</span>
                            )}
                            {c.unread_for_mentor > 0 && (
                              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-petrolio text-crema text-[11px] font-semibold tabular-nums">
                                {c.unread_for_mentor}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-cream/70 truncate">
                            {c.last_message ?? "—"}
                          </div>
                        </div>
                      </div>
                      <time
                        className="text-xs text-cream/50 shrink-0"
                        dateTime={c.last_activity_at}
                      >
                        {timeAgo(c.last_activity_at)}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function RatingsSection({
  summary,
}: {
  summary: Awaited<ReturnType<typeof getMentorRatingsSummary>>;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-medium text-cream/70">Le tue valutazioni</h2>
      <MentorRatingBlock summary={summary} />
    </section>
  );
}
