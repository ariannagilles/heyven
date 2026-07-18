import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import PostDetailArticle from "@/components/PostDetailArticle";
import ReportButton from "@/components/ReportButton";
import ReplyForm from "./ReplyForm";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/time";

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
      "id, author_id, content, created_at, updated_at, space_slug, at_risk, profiles!posts_author_id_fkey(nickname), me_too(count)",
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
    updated_at: string | null;
    space_slug: string;
    at_risk: boolean;
    profiles: { nickname: string } | null;
    me_too: { count: number }[] | null;
  };
  const meTooCount = p.me_too?.[0]?.count ?? 0;
  const nickname = p.profiles?.nickname ?? "anonimo";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <Link href="/" className="text-sm text-petrolio/60 hover:text-petrolio">← torna al feed</Link>

        <PostDetailArticle
          post={{
            id: p.id,
            author_id: p.author_id,
            content: p.content,
            created_at: p.created_at,
            updated_at: p.updated_at ?? null,
            space_slug: p.space_slug,
            at_risk: p.at_risk,
            nickname,
          }}
          viewerId={user?.id ?? null}
          meTooCount={meTooCount}
          userMeToo={userMeToo}
        />

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-petrolio/70 px-1">
            Risposte {replies?.length ? `(${replies.length})` : ""}
          </h2>

          {(replies?.length ?? 0) === 0 ? (
            <div className="card p-5 text-sm text-petrolio/70">
              Ancora nessuna risposta. Scrivere per primə richiede coraggio.
            </div>
          ) : (
            <ul className="space-y-3">
              {(replies as unknown as Reply[]).map((r) => (
                <li key={r.id} className="card p-4">
                  <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-1.5">
                    <span className="font-medium text-petrolio">@{r.profiles?.nickname ?? "anonimo"}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={r.created_at}>{timeAgo(r.created_at)}</time>
                    <ReportButton targetType="reply" targetId={r.id} className="ml-auto shrink-0" />
                  </header>
                  <p className="whitespace-pre-wrap text-petrolio leading-relaxed">{r.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <ReplyForm postId={post.id} />
      </main>
    </>
  );
}
