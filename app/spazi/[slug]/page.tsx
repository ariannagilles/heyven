import { redirect } from "next/navigation";
import SpacePostsList from "@/components/SpacePostsList";
import { createClient } from "@/lib/supabase/server";
import { fetchFeed } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function PostTab({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}`);

  const { items, nextCursor, hasMore } = await fetchFeed(supabase, user.id, {
    spaceSlug: params.slug,
  });

  return (
    <SpacePostsList
      spaceSlug={params.slug}
      initialItems={items}
      initialNextCursor={nextCursor}
      initialHasMore={hasMore}
    />
  );
}
