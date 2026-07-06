import { Suspense } from "react";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import RatingForm from "./RatingForm";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getConversationById } from "@/lib/chat";

export const dynamic = "force-dynamic";

export default async function RateChatPage({
  searchParams,
}: {
  searchParams: { c?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chat/rate");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "user") redirect("/");

  const convId = searchParams.c;
  if (!convId) redirect("/");

  const conversation = await getConversationById(supabase, convId);
  if (!conversation || conversation.user_id !== user.id) redirect("/");

  // Già valutata? salta direttamente.
  const { data: alreadyRated } = await supabase.rpc("has_rated_conversation", {
    p_conversation_id: convId,
  });
  if (alreadyRated === true) redirect("/");

  const mentorProfile = await getProfile(supabase, conversation.mentor_id);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-8 space-y-4">
        <header>
          <h1 className="text-xl font-semibold">Vuoi raccontarci com'è andata?</h1>
          <p className="text-sm text-petrolio/70 mt-1">
            La tua valutazione di @{mentorProfile?.nickname ?? "il tuo mentore"}{" "}
            ci aiuta a prenderci cura della community.
          </p>
        </header>
        <Suspense fallback={null}>
          <RatingForm conversationId={convId} />
        </Suspense>
      </main>
    </>
  );
}
