import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatView from "@/components/ChatView";
import { createClient } from "@/lib/supabase/server";
import { avatarDataUri } from "@/lib/avatar";
import {
  getProfile,
  getConversationById,
  getMessages,
} from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function MentorChatPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/mentor/c/${params.id}`);

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "mentor") redirect("/");

  const conversation = await getConversationById(supabase, params.id);
  if (!conversation || conversation.mentor_id !== user.id) notFound();

  const [userProfile, messages] = await Promise.all([
    getProfile(supabase, conversation.user_id),
    getMessages(supabase, conversation.id),
  ]);

  return (
    <>
      <Navbar />
      <ChatView
        conversationId={conversation.id}
        meId={user.id}
        otherNickname={userProfile?.nickname ?? "anonimo"}
        otherAvatarSrc={avatarDataUri(userProfile?.nickname ?? "anonimo")}
        otherRoleLabel="utente"
        initialMessages={messages}
        initialClosed={conversation.status === "closed"}
        iAmUser={false}
      />
    </>
  );
}
