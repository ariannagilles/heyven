import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import Stars from "@/components/Stars";
import ProfileSettings from "./ProfileSettings";
import { createClient } from "@/lib/supabase/server";
import {
  getProfile,
  getMentorRatingsSummary,
  type Role,
} from "@/lib/chat";
import {
  getUserStats,
  getOwnPosts,
  getOwnQuestions,
  getOwnStories,
  getJoinedAt,
  getClosedConversationsCountForMentor,
} from "@/lib/profile";
import { SPACE_BY_SLUG } from "@/lib/spaces";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

const MONTHS = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

function formatJoined(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

type Tab = "sfoghi" | "domande" | "storie";

function isTab(v: string | undefined): v is Tab {
  return v === "sfoghi" || v === "domande" || v === "storie";
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profilo");

  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect("/login");

  const tab: Tab = isTab(searchParams.tab) ? searchParams.tab : "sfoghi";

  const [stats, joinedAt, sfoghi, domande, storie] = await Promise.all([
    getUserStats(supabase, user.id),
    getJoinedAt(supabase, user.id),
    tab === "sfoghi" ? getOwnPosts(supabase, user.id) : Promise.resolve([]),
    tab === "domande" ? getOwnQuestions(supabase, user.id) : Promise.resolve([]),
    tab === "storie" ? getOwnStories(supabase, user.id) : Promise.resolve([]),
  ]);

  const role: Role = profile.role;
  const isMentor = role === "mentor";

  const [ratings, closedConvs] = isMentor
    ? await Promise.all([
        getMentorRatingsSummary(supabase, user.id),
        getClosedConversationsCountForMentor(supabase, user.id),
      ])
    : [null, 0];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {/* HEADER */}
        <section className="card p-5">
          <div className="flex items-start gap-4">
            <Avatar nickname={profile.nickname} size={80} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold">@{profile.nickname}</h1>
                {isMentor && (
                  <span className="inline-flex items-center rounded-full bg-petrolio text-crema text-xs font-medium px-2.5 py-1">
                    ✦ Mentore Heyven
                  </span>
                )}
                {role === "admin" && (
                  <span className="inline-flex items-center rounded-full bg-petrolio/10 text-petrolio text-xs font-medium px-2.5 py-1">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-petrolio/70 mt-1">
                Su Heyven da {formatJoined(joinedAt)}
              </p>
              <p className="text-xs text-petrolio/50 mt-2">
                Il tuo spazio è anonimo. Nessuno sa chi sei.
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label="Sfoghi" value={stats.posts_count} />
          <Stat label="Domande" value={stats.questions_count} />
          <Stat label="Storie" value={stats.stories_count} />
          <Stat label='"anchʼio" ricevuti' value={stats.reactions_received} />
        </section>

        {/* MENTOR SECTION */}
        {isMentor && ratings && (
          <section className="card p-5 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-medium text-petrolio/70">
                Mentore Heyven
              </h2>
              <Link
                href="/mentor"
                className="text-xs text-petrolio/70 hover:text-petrolio underline underline-offset-2"
              >
                Modifica la mia presentazione
              </Link>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-3xl font-semibold tabular-nums">
                {ratings.count > 0 ? ratings.avg.toFixed(2) : "—"}
              </div>
              <Stars value={ratings.avg} />
              <span className="text-sm text-petrolio/60">
                ({ratings.count} valutazion{ratings.count === 1 ? "e" : "i"})
              </span>
            </div>
            <p className="text-sm text-petrolio/70">
              {closedConvs} conversazion{closedConvs === 1 ? "e" : "i"}{" "}
              completate.
            </p>
          </section>
        )}

        {/* TABS */}
        <nav className="flex items-center gap-1 border-b border-petrolio/10 -mx-4 px-4">
          {(["sfoghi", "domande", "storie"] as const).map((t) => {
            const active = t === tab;
            const labels = { sfoghi: "Sfoghi", domande: "Domande", storie: "Storie" };
            return (
              <Link
                key={t}
                href={`/profilo?tab=${t}`}
                className={
                  "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition " +
                  (active
                    ? "border-petrolio text-petrolio"
                    : "border-transparent text-petrolio/60 hover:text-petrolio")
                }
              >
                {labels[t]}
              </Link>
            );
          })}
        </nav>

        {/* TAB CONTENT */}
        {tab === "sfoghi" && (
          <OwnList
            empty="Non hai ancora pubblicato sfoghi."
            items={sfoghi.map((p) => ({
              key: p.id,
              href: `/post/${p.id}`,
              spaceSlug: p.space_slug,
              created_at: p.created_at,
              snippet: p.content,
              interactions: `${p.me_too_count} anch'io · ${p.reply_count} rispost${p.reply_count === 1 ? "a" : "e"}`,
            }))}
          />
        )}
        {tab === "domande" && (
          <OwnList
            empty="Non hai ancora fatto domande."
            items={domande.map((q) => ({
              key: q.id,
              href: `/spazi/${q.space_slug}/domande/${q.id}`,
              spaceSlug: q.space_slug,
              created_at: q.created_at,
              snippet: q.content,
              interactions: `${q.reply_count} rispost${q.reply_count === 1 ? "a" : "e"}`,
            }))}
          />
        )}
        {tab === "storie" && (
          <OwnList
            empty="Non hai ancora condiviso storie."
            items={storie.map((s) => ({
              key: s.id,
              href: `/spazi/${s.space_slug}/storie`,
              spaceSlug: s.space_slug,
              created_at: s.created_at,
              snippet: s.title || s.content,
              interactions: `${s.reaction_count} anch'io`,
            }))}
          />
        )}

        {/* SETTINGS */}
        <ProfileSettings userId={user.id} currentNickname={profile.nickname} />
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-petrolio/60 mt-0.5">{label}</div>
    </div>
  );
}

type OwnItem = {
  key: string;
  href: string;
  spaceSlug: string;
  created_at: string;
  snippet: string;
  interactions: string;
};

function OwnList({ items, empty }: { items: OwnItem[]; empty: string }) {
  if (items.length === 0) {
    return (
      <div className="card p-8 text-center text-petrolio/70">{empty}</div>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((i) => {
        const space = SPACE_BY_SLUG[i.spaceSlug];
        return (
          <li key={i.key}>
            <Link
              href={i.href}
              className="card block p-4 hover:bg-white transition"
            >
              <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-2 flex-wrap">
                <span className="chip">
                  {space?.emoji} {space?.name ?? i.spaceSlug}
                </span>
                <span aria-hidden>·</span>
                <time dateTime={i.created_at}>{timeAgo(i.created_at)}</time>
              </header>
              <p className="text-petrolio leading-relaxed line-clamp-3">
                {i.snippet}
              </p>
              <p className="text-xs text-petrolio/60 mt-2">{i.interactions}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
