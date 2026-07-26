import MentorMeetingView from "@/components/mentor/MentorMeetingView";
import { createClient } from "@/lib/supabase/server";
import {
  getAssignedMentorProfile,
  getProfile,
  getUserConversation,
} from "@/lib/chat";
import { getUserActiveConversationListItem } from "@/lib/mentor-list";
import { mentorPresenceLabel } from "@/lib/mentor-list-types";
import { MENTOR_PREVIEW, monthsSince } from "@/lib/mentor-display";
import { redirect } from "next/navigation";

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

  if (!conversation) {
    return (
      <MentorMeetingView
        mode="preview"
        mentor={MENTOR_PREVIEW}
        presenceLabel={mentorPresenceLabel(null)}
      />
    );
  }

  const [mentorUserProfile, activeItem, mentorRow, assignedProfile] =
    await Promise.all([
      getProfile(supabase, conversation.mentor_id),
      getUserActiveConversationListItem(supabase, user.id),
      supabase
        .from("mentors")
        .select("created_at, intro_text, experience_areas")
        .eq("user_id", conversation.mentor_id)
        .maybeSingle(),
      getAssignedMentorProfile(supabase),
    ]);

  const introText =
    mentorRow.data?.intro_text?.trim() ||
    assignedProfile?.intro_text?.trim() ||
    MENTOR_PREVIEW.intro_text;

  const experienceAreas =
    (mentorRow.data?.experience_areas?.length
      ? mentorRow.data.experience_areas
      : assignedProfile?.experience_areas) ?? [];

  const monthsHere = mentorRow.data?.created_at
    ? monthsSince(mentorRow.data.created_at)
    : MENTOR_PREVIEW.months_here;

  return (
    <MentorMeetingView
      mode="profile"
      conversationId={conversation.id}
      presenceLabel={mentorPresenceLabel(
        activeItem?.mentor_last_activity_at ?? null,
      )}
      mentor={{
        nickname:
          mentorUserProfile?.nickname ??
          assignedProfile?.nickname ??
          "mentore",
        intro_text: introText,
        experience_areas: experienceAreas,
        months_here: monthsHere,
        people_accompanied: assignedProfile?.completed_conversations ?? 0,
      }}
    />
  );
}
