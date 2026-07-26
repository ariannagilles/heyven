import { redirect } from "next/navigation";
import MentorMeetingView from "@/components/mentor/MentorMeetingView";
import { createClient } from "@/lib/supabase/server";
import {
  getAssignedMentorProfile,
  getProfile,
  getUserConversation,
} from "@/lib/chat";
import {
  MENTOR_PREVIEW,
  monthsSince,
} from "@/lib/mentor-display";

export const dynamic = "force-dynamic";

export default async function MentorIncontroPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chat/incontro");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role === "mentor") redirect("/mentor");
  if (profile?.role === "admin") redirect("/admin");

  const conversation = await getUserConversation(supabase, user.id);
  if (conversation) redirect("/chat");

  return <MentorMeetingView mode="preview" mentor={MENTOR_PREVIEW} />;
}
