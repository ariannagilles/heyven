import Link from "next/link";
import Navbar from "@/components/Navbar";
import HomeFeedList from "@/components/HomeFeedList";
import SectionLabel from "@/components/SectionLabel";
import HomeCheckIn from "@/components/home/HomeCheckIn";
import HomeMentorCard from "@/components/home/HomeMentorCard";
import { createClient } from "@/lib/supabase/server";
import { fetchUnifiedHomeFeed } from "@/lib/unified-feed";
import { getProfile } from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let feed: Awaited<ReturnType<typeof fetchUnifiedHomeFeed>> | null = null;
  let profile: Awaited<ReturnType<typeof getProfile>> = null;

  if (user) {
    const [feedResult, profileResult] = await Promise.all([
      fetchUnifiedHomeFeed(supabase, user.id),
      getProfile(supabase, user.id),
    ]);
    feed = feedResult;
    profile = profileResult;
  }

  const nickname = profile?.nickname ?? "luna42";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-6 px-4 pb-24 pt-6">
        <header>
          <h1 className="font-display text-[25px] leading-tight text-cream">
            Ciao, {nickname}
          </h1>
          <p className="mt-1 text-sm text-cream/70">
            Qui sei solo tu a sapere chi c&apos;è dietro.
          </p>
        </header>

        <section>
          <SectionLabel>Come ti senti oggi?</SectionLabel>
          <HomeCheckIn />
        </section>

        <section>
          <SectionLabel>Il tuo spazio di ascolto</SectionLabel>
          <HomeMentorCard />
        </section>

        <section>
          <SectionLabel>Dai tuoi spazi</SectionLabel>
          {!feed || feed.items.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-cream/80">Ancora nulla qui.</p>
              <p className="mt-1 text-sm text-cream/60">
                Esplora gli spazi per iniziare a condividere.
              </p>
              <Link href="/spazi" className="btn-primary mt-4 inline-flex">
                Esplora
              </Link>
            </div>
          ) : (
            <HomeFeedList
              initialItems={feed.items}
              initialNextCursor={feed.nextCursor}
              initialHasMore={feed.hasMore}
            />
          )}
        </section>
      </main>
    </>
  );
}
