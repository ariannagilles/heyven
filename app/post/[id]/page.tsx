import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ContentDetailBody from "@/components/content/ContentDetailBody";
import ContentDetailChrome from "@/components/content/ContentDetailChrome";
import ContentDetailHeader, {
  contentDetailTitle,
} from "@/components/content/ContentDetailHeader";
import ContentReplyList from "@/components/content/ContentReplyList";
import ReactionBar from "@/components/content/ReactionBar";
import ReplyForm from "./ReplyForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Reply = {
  id: string;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
};

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(
      "id, author_id, content, created_at, edited_at, space_slug, at_risk, profiles!posts_author_id_fkey(nickname), me_too(count), replies(count)",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (postError) {
    throw new Error(postError.message);
  }

  if (!post) notFound();

  const { data: replies } = await supabase
    .from("replies")
    .select("id, content, created_at, profiles!replies_author_id_fkey(nickname)")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  let userMeToo = false;
  if (user) {
    const { data } = await supabase
      .from("me_too")
      .select("post_id")
      .eq("post_id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    userMeToo = !!data;
  }

  const p = post as unknown as {
    id: string;
    author_id: string;
    content: string;
    created_at: string;
    edited_at: string | null;
    space_slug: string;
    at_risk: boolean;
    profiles: { nickname: string } | null;
    me_too: { count: number }[] | null;
    replies: { count: number }[] | null;
  };
  const meTooCount = p.me_too?.[0]?.count ?? 0;
  const replyCount = p.replies?.[0]?.count ?? replies?.length ?? 0;
  const isAuthor = user?.id === p.author_id;
  const backHref = `/spazi/${p.space_slug}?tipo=sfogo`;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 pt-6">
        <ContentDetailChrome
          replyForm={<ReplyForm postId={post.id} />}
          reactionBar={
            <ReactionBar
              kind="sfogo"
              postId={p.id}
              initialCount={meTooCount}
              initialActive={userMeToo}
            />
          }
        >
          <ContentDetailHeader
            backHref={backHref}
            title={contentDetailTitle("sfogo", isAuthor)}
          />
          <ContentDetailBody
            kind="sfogo"
            id={p.id}
            authorId={p.author_id}
            viewerId={user?.id ?? null}
            content={p.content}
            createdAt={p.created_at}
            editedAt={p.edited_at ?? null}
            atRisk={p.at_risk}
            replyCount={replyCount}
            reactionCount={meTooCount}
          />
          <ContentReplyList
            replies={((replies as unknown as Reply[]) ?? []).map((r) => ({
              id: r.id,
              content: r.content,
              nickname: r.profiles?.nickname ?? "anonimo",
              reportTargetType: "reply" as const,
            }))}
            emptyMessage="Ancora nessuna risposta. Scrivere per primə richiede coraggio."
          />
        </ContentDetailChrome>
      </main>
    </>
  );
}
