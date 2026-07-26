import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileSubpageHeader from "@/components/profile/ProfileSubpageHeader";
import ProfileSettings from "../ProfileSettings";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profilo/impostazioni");

  const profile = await getProfile(supabase, user.id);
  if (!profile) redirect("/login");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pb-24 pt-6">
        <ProfileSubpageHeader title="Impostazioni e privacy" />
        <ProfileSettings userId={user.id} currentNickname={profile.nickname} />
      </main>
    </>
  );
}
