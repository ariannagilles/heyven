import { redirect } from "next/navigation";
import MentorListScreen from "@/components/mentor/MentorListScreen";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/chat";
import {
  getUserActiveConversationListItem,
  getUserClosedConversations,
} from "@/lib/mentor-list";

export const dynamic = "force-dynamic";

export default async function ChatListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chat");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role === "mentor") redirect("/mentor");
  if (profile?.role === "admin") redirect("/admin");

  const [active, past] = await Promise.all([
    getUserActiveConversationListItem(supabase, user.id),
    getUserClosedConversations(supabase, user.id),
  ]);

  return (
    <MentorListScreen
      active={active}
      past={past}
      userNickname={profile?.nickname ?? "tu"}
    />
  );
}
