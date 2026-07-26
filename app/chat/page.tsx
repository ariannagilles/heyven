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

export default async function ChatPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chat");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role === "mentor") redirect("/mentor");
  if (profile?.role === "admin") redirect("/admin");

  const conversation = await getUserConversation(supabase, user.id);

  if (!conversation) {
    return <MentorMeetingView mode="preview" mentor={MENTOR_PREVIEW} />;
  }

  const mentorProfile = await getAssignedMentorProfile(supabase);
  if (!mentorProfile) redirect("/chat/c");

  const { data: mentorRow } = await supabase
    .from("mentors")
    .select("created_at, intro_text, experience_areas")
    .eq("user_id", mentorProfile.mentor_id)
    .maybeSingle();

  const introText =
    mentorRow?.intro_text?.trim() ||
    mentorProfile.intro_text?.trim() ||
    MENTOR_PREVIEW.intro_text;

  const experienceAreas =
    (mentorRow?.experience_areas?.length
      ? mentorRow.experience_areas
      : mentorProfile.experience_areas) ?? [];

  const monthsHere = mentorRow?.created_at
    ? monthsSince(mentorRow.created_at)
    : MENTOR_PREVIEW.months_here;

  const peopleAccompanied = mentorProfile.completed_conversations;

  return (
    <MentorMeetingView
      mode="active"
      mentor={{
        nickname: mentorProfile.nickname,
        intro_text: introText,
        experience_areas: experienceAreas,
        months_here: monthsHere,
        people_accompanied: peopleAccompanied,
      }}
    />
  );
}
