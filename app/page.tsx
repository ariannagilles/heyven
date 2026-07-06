import Link from "next/link";
import Navbar from "@/components/Navbar";
import MixedFeedItem from "@/components/MixedFeedItem";
import { createClient } from "@/lib/supabase/server";
import { fetchUnifiedHomeFeed } from "@/lib/unified-feed";
import { getProfile, getUserChatPreview } from "@/lib/chat";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const items = user ? await fetchUnifiedHomeFeed(supabase, user.id) : [];

  const profile = user ? await getProfile(supabase, user.id) : null;
  const isUser = profile?.role === "user";
  const chatPreview =
    user && isUser ? await getUserChatPreview(supabase, user.id) : null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        {isUser && <MentorCard preview={chatPreview} />}

        {items.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-petrolio/80">Ancora nulla qui.</p>
            <p className="text-sm text-petrolio/60 mt-1">
              Esplora gli spazi per iniziare a condividere.
            </p>
            <Link href="/spazi" className="btn-primary mt-4 inline-flex">
              Esplora
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((it) => (
              <li key={`${it.kind}-${it.id}`}>
                <MixedFeedItem item={it} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function MentorCard({
  preview,
}: {
  preview: Awaited<ReturnType<typeof getUserChatPreview>>;
}) {
  if (!preview) {
    return (
      <section className="card p-5 bg-petrolio text-crema border-petrolio/20">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-full bg-crema/15 items-center justify-center text-2xl shrink-0">
            ✦
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Il tuo Mentore ti aspetta</h2>
            <p className="text-sm text-crema/80 mt-1">
              Una persona formata pronta ad ascoltarti. Chat asincrona,
              gratuita, riservata.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 mt-4 rounded-full bg-crema text-petrolio px-5 py-2.5 text-sm font-medium hover:bg-crema-200 transition"
            >
              Inizia la chat
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <Link
      href="/chat"
      className="card block p-5 hover:bg-white transition relative"
    >
      {preview.unread > 0 && (
        <span
          aria-label={`${preview.unread} nuovi messaggi`}
          className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-red-500"
        />
      )}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-petrolio text-crema flex items-center justify-center text-lg font-semibold shrink-0">
          {(preview.mentorNickname ?? "M").slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold">
            Continua la chat con il tuo Mentore
          </h2>
          <p className="text-xs text-petrolio/60 mt-0.5">
            @{preview.mentorNickname ?? "mentore"} ·{" "}
            {timeAgo(preview.lastActivityAt)}
          </p>
          <p className="text-sm text-petrolio/80 mt-2 line-clamp-2">
            {preview.lastMessage ?? "Nessun messaggio ancora — scrivi tu per primə."}
          </p>
        </div>
      </div>
    </Link>
  );
}
