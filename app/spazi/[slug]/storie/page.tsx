import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import ReportButton from "@/components/ReportButton";
import StoryReactionButton from "@/components/StoryReactionButton";
import StoryForm from "./StoryForm";
import { createClient } from "@/lib/supabase/server";
import { getStories } from "@/lib/space-content";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function StorieTab({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}/storie`);

  const { items: stories } = await getStories(supabase, params.slug, user.id, {
    limit: 1000,
  });

  return (
    <div className="space-y-4">
      <StoryForm spaceSlug={params.slug} />

      {stories.length === 0 ? (
        <div className="card p-8 text-center text-petrolio/70">
          Nessuna storia, ancora. Vuoi raccontare la tua?
        </div>
      ) : (
        <ul className="space-y-4">
          {stories.map((s) => (
            <li key={s.id} className="card p-5">
              <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3">
                <Avatar nickname={s.nickname} size={32} />
                <span className="font-medium text-petrolio">@{s.nickname}</span>
                <span aria-hidden>·</span>
                <time dateTime={s.created_at}>{timeAgo(s.created_at)}</time>
                <ReportButton targetType="story" targetId={s.id} className="ml-auto shrink-0" />
              </header>
              {s.title && (
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              )}
              <p className="text-[15px] text-petrolio leading-relaxed whitespace-pre-wrap">
                {s.content}
              </p>
              <footer className="mt-4">
                <StoryReactionButton
                  storyId={s.id}
                  initialCount={s.reaction_count}
                  initialActive={s.has_reacted}
                />
              </footer>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
