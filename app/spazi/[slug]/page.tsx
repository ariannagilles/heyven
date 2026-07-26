import { redirect } from "next/navigation";
import SpaceFeedHeader from "@/components/space/SpaceFeedHeader";
import SpaceFeedView from "@/components/space/SpaceFeedView";
import { createClient } from "@/lib/supabase/server";
import { fetchSpaceFeedInitial } from "@/lib/feed-actions";
import { getSpacePeopleToday, parseSpaceFeedFilter } from "@/lib/space-feed";
import { SPACE_BY_SLUG } from "@/lib/spaces";

export const dynamic = "force-dynamic";

export default async function SpaceFeedPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { tipo?: string };
}) {
  const space = SPACE_BY_SLUG[params.slug];
  if (!space) redirect("/spazi");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}`);

  const filter = parseSpaceFeedFilter(searchParams.tipo);

  const [initialPage, peopleToday] = await Promise.all([
    fetchSpaceFeedInitial(params.slug, filter),
    getSpacePeopleToday(supabase, params.slug),
  ]);

  return (
    <>
      <SpaceFeedHeader spaceName={space.name} peopleToday={peopleToday} />
      <SpaceFeedView
        spaceSlug={params.slug}
        initialFilter={filter}
        initialPage={initialPage}
      />
    </>
  );
}
