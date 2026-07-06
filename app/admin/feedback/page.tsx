import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/chat";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

type FeedbackType = "bug" | "idea" | "message";

const TYPE_META: Record<FeedbackType, { emoji: string; label: string }> = {
  bug:     { emoji: "🐛", label: "Problema" },
  idea:    { emoji: "💡", label: "Idea" },
  message: { emoji: "❤️", label: "Messaggio" },
};

type FeedbackRow = {
  id: string;
  user_id: string | null;
  type: FeedbackType;
  content: string;
  current_page: string | null;
  created_at: string;
  profiles: { nickname: string } | null;
};

function isFilter(v: string | undefined): v is FeedbackType | "all" {
  return v === "bug" || v === "idea" || v === "message" || v === "all";
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/feedback");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "admin") redirect("/");

  const filter = isFilter(searchParams.type) ? searchParams.type : "all";

  let query = supabase
    .from("feedbacks")
    .select(
      "id, user_id, type, content, current_page, created_at, profiles!feedbacks_user_id_fkey(nickname)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (filter !== "all") query = query.eq("type", filter);

  const { data, error } = await query;
  const rows = (data as unknown as FeedbackRow[] | null) ?? [];

  const tabs: { key: "all" | FeedbackType; label: string }[] = [
    { key: "all",     label: "Tutti" },
    { key: "bug",     label: "🐛 Problemi" },
    { key: "idea",    label: "💡 Idee" },
    { key: "message", label: "❤️ Messaggi" },
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <header className="card p-5">
          <h1 className="text-lg font-semibold">Feedback beta</h1>
          <p className="text-sm text-petrolio/70 mt-1">
            {rows.length} feedback {filter !== "all" && `(filtro: ${TYPE_META[filter].label.toLowerCase()})`}
          </p>
        </header>

        <nav className="flex flex-wrap items-center gap-1 border-b border-petrolio/10 -mx-4 px-4">
          {tabs.map((t) => {
            const active = filter === t.key;
            const href =
              t.key === "all" ? "/admin/feedback" : `/admin/feedback?type=${t.key}`;
            return (
              <Link
                key={t.key}
                href={href}
                className={
                  "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition " +
                  (active
                    ? "border-petrolio text-petrolio"
                    : "border-transparent text-petrolio/60 hover:text-petrolio")
                }
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
            {error.message}
          </p>
        )}

        {rows.length === 0 ? (
          <div className="card p-8 text-center text-petrolio/70">
            Nessun feedback.
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((f) => {
              const meta = TYPE_META[f.type];
              const nickname = f.profiles?.nickname ?? null;
              return (
                <li key={f.id} className="card p-4">
                  <header className="flex items-center justify-between gap-2 flex-wrap mb-2 text-xs text-petrolio/60">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-base" aria-hidden>{meta.emoji}</span>
                      <span className="font-medium text-petrolio">{meta.label}</span>
                      {nickname && (
                        <>
                          <span aria-hidden>·</span>
                          <span>@{nickname}</span>
                        </>
                      )}
                      {!nickname && f.user_id === null && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="italic">utente sconosciuto</span>
                        </>
                      )}
                    </div>
                    <time dateTime={f.created_at}>{timeAgo(f.created_at)}</time>
                  </header>

                  <p className="text-petrolio leading-relaxed whitespace-pre-wrap">
                    {f.content}
                  </p>

                  {f.current_page && (
                    <p className="mt-2 text-xs text-petrolio/50 font-mono break-all">
                      {f.current_page}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
