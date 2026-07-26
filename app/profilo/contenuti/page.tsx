import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileOwnList from "@/components/ProfileOwnList";
import ProfileSubpageHeader from "@/components/profile/ProfileSubpageHeader";
import {
  mapOwnPost,
  mapOwnQuestion,
  mapOwnStory,
  type ProfileTab,
} from "@/lib/profile-list";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/chat";
import {
  getOwnPosts,
  getOwnQuestions,
  getOwnStories,
} from "@/lib/profile";

export const dynamic = "force-dynamic";

type Tab = ProfileTab;

function isTab(v: string | undefined): v is Tab {
  return v === "sfoghi" || v === "domande" || v === "storie";
}

export default async function ProfileContentsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profilo/contenuti");

  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect("/login");

  const tab: Tab = isTab(searchParams.tab) ? searchParams.tab : "sfoghi";

  const [sfoghiRes, domandeRes, storieRes] = await Promise.all([
    tab === "sfoghi" ? getOwnPosts(supabase, user.id) : null,
    tab === "domande" ? getOwnQuestions(supabase, user.id) : null,
    tab === "storie" ? getOwnStories(supabase, user.id) : null,
  ]);

  const tabFeed =
    tab === "sfoghi"
      ? sfoghiRes
      : tab === "domande"
        ? domandeRes
        : storieRes;

  const profileItems =
    tab === "sfoghi"
      ? (sfoghiRes?.items ?? []).map(mapOwnPost)
      : tab === "domande"
        ? (domandeRes?.items ?? []).map(mapOwnQuestion)
        : (storieRes?.items ?? []).map(mapOwnStory);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pb-24 pt-6">
        <ProfileSubpageHeader title="I tuoi contenuti" />

        <nav
          aria-label="Tipi di contenuto"
          className="flex items-center gap-1 border-b border-cream/10"
        >
          {(["sfoghi", "domande", "storie"] as const).map((t) => {
            const active = t === tab;
            const labels = {
              sfoghi: "Sfoghi",
              domande: "Domande",
              storie: "Storie",
            };
            return (
              <Link
                key={t}
                href={`/profilo/contenuti?tab=${t}`}
                className={
                  "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition " +
                  (active
                    ? "border-mint text-cream"
                    : "border-transparent text-cream/55 hover:text-cream/80")
                }
              >
                {labels[t]}
              </Link>
            );
          })}
        </nav>

        <ProfileOwnList
          tab={tab}
          empty={
            tab === "sfoghi"
              ? "Non hai ancora pubblicato sfoghi."
              : tab === "domande"
                ? "Non hai ancora fatto domande."
                : "Non hai ancora condiviso storie."
          }
          initialItems={profileItems}
          initialNextCursor={tabFeed?.nextCursor ?? null}
          initialHasMore={tabFeed?.hasMore ?? false}
        />
      </main>
    </>
  );
}
