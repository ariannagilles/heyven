import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ClearFlagButton from "./ClearFlagButton";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/chat";

export const dynamic = "force-dynamic";

type MentorRow = {
  user_id: string;
  nickname: string;
  is_flagged: boolean;
  avg_rating: number | string;
  ratings_count: number;
  conversations_count: number;
  is_available: boolean;
  active_users_count: number;
};

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "admin") redirect("/");

  const { data: rows, error } = await supabase.rpc("admin_mentors_overview");
  const mentors = (rows ?? []) as MentorRow[];
  const flaggedCount = mentors.filter((m) => m.is_flagged).length;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <header className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold">Dashboard admin</h1>
              <p className="text-sm text-petrolio/70 mt-1">
                {mentors.length} mentori
                {flaggedCount > 0 && (
                  <>
                    {" · "}
                    <span className="text-red-700 font-medium">
                      {flaggedCount} segnalat{flaggedCount === 1 ? "o" : "i"}
                    </span>
                  </>
                )}
              </p>
            </div>
            <Link href="/admin/feedback" className="btn-outline text-sm shrink-0">
              Feedback
            </Link>
          </div>
        </header>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
            {error.message}
          </p>
        )}

        {mentors.length === 0 ? (
          <div className="card p-8 text-center text-petrolio/70">
            Nessun mentore registrato.
          </div>
        ) : (
          <ul className="space-y-3">
            {mentors.map((m) => {
              const avg = Number(m.avg_rating);
              return (
                <li key={m.user_id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">@{m.nickname}</span>
                        {m.is_flagged && (
                          <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1">
                            segnalato
                          </span>
                        )}
                        {!m.is_available && (
                          <span className="chip text-petrolio/60">non disponibile</span>
                        )}
                      </div>
                      <div className="text-sm text-petrolio/70 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>
                          ★{" "}
                          <span className="font-medium tabular-nums">
                            {m.ratings_count > 0 ? avg.toFixed(2) : "—"}
                          </span>{" "}
                          <span className="text-petrolio/50">
                            ({m.ratings_count} valutazion{m.ratings_count === 1 ? "e" : "i"})
                          </span>
                        </span>
                        <span>
                          {m.conversations_count} conversazion
                          {m.conversations_count === 1 ? "e" : "i"}
                        </span>
                        <span>{m.active_users_count} attive ora</span>
                      </div>
                    </div>
                    {m.is_flagged && <ClearFlagButton mentorId={m.user_id} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
