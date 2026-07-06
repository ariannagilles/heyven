import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import Stars from "@/components/Stars";
import IntroEditor from "./IntroEditor";
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

  const [{ data: mentorRow }, chats, ratings] = await Promise.all([
    supabase
      .from("mentors")
      .select("is_available, active_users_count, intro_text")
      .eq("user_id", user.id)
      .maybeSingle(),
    getMentorChats(supabase),
    getMentorRatingsSummary(supabase, user.id),
  ]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <header className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar nickname={profile.nickname} size={48} />
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">
                  @{profile.nickname}
                </h1>
                <p className="text-sm text-petrolio/70">
                  Dashboard mentore · {chats.length} chat
                </p>
              </div>
            </div>
            <span
              className={
                "chip shrink-0 " +
                (mentorRow?.is_available ? "text-petrolio" : "text-petrolio/50")
              }
            >
              {mentorRow?.is_available ? "disponibile" : "non disponibile"}
            </span>
          </div>
        </header>

        <section className="card p-5 space-y-3">
          <div>
            <h2 className="text-sm font-medium text-petrolio/70">
              La tua presentazione
            </h2>
            <p className="text-xs text-petrolio/60 mt-1">
              Questa frase appare nel tuo profilo prima che l'utente apra la
              chat.
            </p>
          </div>
          <IntroEditor
            mentorId={user.id}
            initial={mentorRow?.intro_text ?? ""}
          />
        </section>

        <RatingsSection summary={ratings} />

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-petrolio/70 px-1">
            Le tue chat
          </h2>
          {chats.length === 0 ? (
            <div className="card p-8 text-center text-petrolio/70">
              Ancora nessuna chat assegnata.
            </div>
          ) : (
            <ul className="space-y-3">
              {chats.map((c) => (
                <li key={c.conversation_id}>
                  <Link
                    href={`/mentor/c/${c.conversation_id}`}
                    className="card block p-4 hover:bg-white transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar nickname={c.user_nickname} size={40} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">@{c.user_nickname}</span>
                            {c.status === "closed" && (
                              <span className="chip text-petrolio/60">chiusa</span>
                            )}
                            {c.unread_for_mentor > 0 && (
                              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-petrolio text-crema text-[11px] font-semibold tabular-nums">
                                {c.unread_for_mentor}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-petrolio/70 truncate">
                            {c.last_message ?? "—"}
                          </div>
                        </div>
                      </div>
                      <time
                        className="text-xs text-petrolio/50 shrink-0"
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
    <section className="card p-5 space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-petrolio/70">
          Le tue valutazioni
        </h2>
        <span className="text-xs text-petrolio/50 tabular-nums">
          {summary.count} valutazion{summary.count === 1 ? "e" : "i"}
        </span>
      </div>

      {summary.count === 0 ? (
        <p className="text-sm text-petrolio/70">
          Nessuna valutazione ancora. Apparirà qui dopo che un utente avrà
          chiuso una chat con te.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-semibold tabular-nums">
              {summary.avg.toFixed(2)}
            </div>
            <Stars value={summary.avg} />
          </div>

          <ul className="space-y-2 pt-2 border-t border-petrolio/10">
            {summary.ratings.map((r) => (
              <li key={r.id} className="py-2">
                <div className="flex items-center justify-between gap-2">
                  <Stars value={r.rating} size="sm" />
                  <time className="text-xs text-petrolio/50" dateTime={r.created_at}>
                    {timeAgo(r.created_at)}
                  </time>
                </div>
                {r.feedback && (
                  <p className="text-sm text-petrolio/80 mt-1.5 whitespace-pre-wrap">
                    {r.feedback}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
