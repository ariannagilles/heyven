import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatView from "@/components/ChatView";
import { createClient } from "@/lib/supabase/server";
import { avatarDataUri } from "@/lib/avatar";
import {
  getProfile,
  getUserConversation,
  getMessages,
} from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function UserChatPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chat/c");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role === "mentor") redirect("/mentor");
  if (profile?.role === "admin") redirect("/admin");

  const conversation = await getUserConversation(supabase, user.id);
  if (!conversation) redirect("/chat");

  const [mentorProfile, messages] = await Promise.all([
    getProfile(supabase, conversation.mentor_id),
    getMessages(supabase, conversation.id),
  ]);

  return (
    <>
      <Navbar />
      <ChatView
        conversationId={conversation.id}
        meId={user.id}
        otherNickname={mentorProfile?.nickname ?? "mentore"}
        otherAvatarSrc={avatarDataUri(mentorProfile?.nickname ?? "mentore")}
        otherRoleLabel="il tuo mentore"
        initialMessages={messages}
        initialClosed={conversation.status === "closed"}
        iAmUser
      />
    </>
  );
}
