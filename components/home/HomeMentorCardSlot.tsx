import { createClient, getCachedUser } from "@/lib/supabase/server";
import { getHomeMentorCardState } from "@/lib/chat";
import HomeMentorCard from "@/components/home/HomeMentorCard";

export default async function HomeMentorCardSlot() {
  const user = await getCachedUser();
  if (!user) {
    return <HomeMentorCard state={{ status: "idle" }} />;
  }

  const supabase = createClient();
  const state = await getHomeMentorCardState(supabase, user.id);
  return <HomeMentorCard state={state} />;
}
