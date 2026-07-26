import { notFound, redirect } from "next/navigation";
import ChatView from "@/components/ChatView";
import { createClient } from "@/lib/supabase/server";
import { avatarDataUri } from "@/lib/avatar";
import { getConversationById, getMessages, getProfile } from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function UserConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/chat/c/${params.id}`);

  const profile = await getProfile(supabase, user.id);
  if (profile?.role === "mentor") redirect("/mentor");
  if (profile?.role === "admin") redirect("/admin");

  const conversation = await getConversationById(supabase, params.id);
  if (!conversation || conversation.user_id !== user.id) notFound();

  const [mentorProfile, messages] = await Promise.all([
    getProfile(supabase, conversation.mentor_id),
    getMessages(supabase, conversation.id),
  ]);

  return (
    <div className="-mb-28 h-dvh">
      <ChatView
        conversationId={conversation.id}
        meId={user.id}
        otherNickname={mentorProfile?.nickname ?? "mentore"}
        otherAvatarSrc={avatarDataUri(mentorProfile?.nickname ?? "mentore")}
        otherRoleLabel="il tuo mentore"
        initialMessages={messages}
        initialClosed={conversation.status === "closed"}
        iAmUser
        fullScreen
      />
    </div>
  );
}
