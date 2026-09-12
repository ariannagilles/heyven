import { redirect } from "next/navigation";
import ChatView from "@/components/ChatView";
import { createClient, getCachedUser } from "@/lib/supabase/server";
import { avatarDataUri } from "@/lib/avatar";
import {
  getConversationById,
  getMessages,
  getProfile,
  getUserConversation,
} from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function ActiveChatRedirectPage() {
  const supabase = createClient();
  const user = await getCachedUser();
  if (!user) redirect("/login?next=/chat/c");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role === "mentor") redirect("/mentor");
  if (profile?.role === "admin") redirect("/admin");

  const conversation = await getUserConversation(supabase, user.id);
  if (!conversation) redirect("/chat");

  redirect(`/chat/c/${conversation.id}`);
}
