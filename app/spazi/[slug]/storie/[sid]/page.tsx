import { notFound, redirect } from "next/navigation";
import ContentDetailBody from "@/components/content/ContentDetailBody";
import ContentDetailChrome from "@/components/content/ContentDetailChrome";
import ContentDetailHeader, {
  contentDetailTitle,
} from "@/components/content/ContentDetailHeader";
import ReactionBar from "@/components/content/ReactionBar";
import { createClient } from "@/lib/supabase/server";
import { SPACE_BY_SLUG } from "@/lib/spaces";
import { getStory } from "@/lib/space-content";

export const dynamic = "force-dynamic";

export default async function StoryDetailPage({
  params,
}: {
  params: { slug: string; sid: string };
}) {
  const space = SPACE_BY_SLUG[params.slug];
  if (!space) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}/storie/${params.sid}`);

  const story = await getStory(supabase, params.sid, user.id);
  if (!story || story.space_slug !== params.slug) notFound();

  const isAuthor = user.id === story.author_id;

  return (
    <ContentDetailChrome
      reactionBar={
        <ReactionBar
          kind="storia"
          storyId={story.id}
          initialCount={story.reaction_count}
          initialActive={story.has_reacted}
        />
      }
    >
      <ContentDetailHeader
        backHref={`/spazi/${params.slug}?tipo=storia`}
        title={contentDetailTitle("storia", isAuthor)}
      />
      <ContentDetailBody
        kind="storia"
        id={story.id}
        authorId={story.author_id}
        viewerId={user.id}
        content={story.content}
        title={story.title}
        createdAt={story.created_at}
        editedAt={story.edited_at}
        atRisk={story.at_risk}
        reactionCount={story.reaction_count}
      />
    </ContentDetailChrome>
  );
}
