import { redirect } from "next/navigation";
import RateConversationClient from "./RateConversationClient";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getConversationById } from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function RateChatPage({
  searchParams,
}: {
  searchParams: { c?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chat/rate");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "user") redirect("/");

  const convId = searchParams.c;
  if (!convId) redirect("/chat");

  const conversation = await getConversationById(supabase, convId);
  if (!conversation || conversation.user_id !== user.id) redirect("/chat");

  const { data: alreadyRated } = await supabase.rpc("has_rated_conversation", {
    p_conversation_id: convId,
  });
  if (alreadyRated === true) redirect("/chat");

  const mentorProfile = await getProfile(supabase, conversation.mentor_id);

  return (
    <RateConversationClient
      conversationId={convId}
      mentorNickname={mentorProfile?.nickname ?? "mentore"}
    />
  );
}
