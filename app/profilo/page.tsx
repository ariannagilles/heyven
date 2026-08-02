import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileHubHeader from "@/components/profile/ProfileHubHeader";
import ProfileMenuList from "@/components/profile/ProfileMenuList";
import ProfilePathBlock from "@/components/profile/ProfilePathBlock";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/chat";
import { getJoinedAt } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  if (searchParams.tab) {
    redirect(`/profilo/contenuti?tab=${searchParams.tab}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profilo");

  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect("/login");

  const joinedAt = await getJoinedAt(supabase, user.id);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-6 px-4 pb-24 pt-6">
        <ProfileHubHeader nickname={profile.nickname} joinedAt={joinedAt} />
        <ProfilePathBlock />
        <ProfileMenuList isMentor={profile.role === "mentor"} />
      </main>
    </>
  );
}
