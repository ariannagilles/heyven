import SpaceStoriesList from "@/components/SpaceStoriesList";
import StoryForm from "./StoryForm";
import { createClient } from "@/lib/supabase/server";
import { getStories } from "@/lib/space-content";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StorieTab({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}/storie`);

  const { items, nextCursor, hasMore } = await getStories(
    supabase,
    params.slug,
    user.id,
  );

  return (
    <div className="space-y-4">
      <StoryForm spaceSlug={params.slug} />
      <SpaceStoriesList
        spaceSlug={params.slug}
        initialItems={items}
        initialNextCursor={nextCursor}
        initialHasMore={hasMore}
      />
    </div>
  );
}
