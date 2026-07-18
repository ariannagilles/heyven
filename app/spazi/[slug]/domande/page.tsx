import SpaceQuestionsList from "@/components/SpaceQuestionsList";
import QuestionForm from "./QuestionForm";
import { createClient } from "@/lib/supabase/server";
import { getQuestions } from "@/lib/space-content";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DomandeTab({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}/domande`);

  const { items, nextCursor, hasMore } = await getQuestions(supabase, params.slug);

  return (
    <div className="space-y-4">
      <QuestionForm spaceSlug={params.slug} />
      <SpaceQuestionsList
        spaceSlug={params.slug}
        viewerId={user.id}
        initialItems={items}
        initialNextCursor={nextCursor}
        initialHasMore={hasMore}
      />
    </div>
  );
}
