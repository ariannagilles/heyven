import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import MeTooButton from "@/components/MeTooButton";
import ReportButton from "@/components/ReportButton";
import ReplyForm from "./ReplyForm";
import { createClient } from "@/lib/supabase/server";
import { SPACE_BY_SLUG } from "@/lib/spaces";
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
      "id, content, created_at, space_slug, profiles!posts_author_id_fkey(nickname), me_too(count)",
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
    content: string;
    created_at: string;
    space_slug: string;
    profiles: { nickname: string } | null;
    me_too: { count: number }[] | null;
  };
  const space = SPACE_BY_SLUG[p.space_slug];
  const meTooCount = p.me_too?.[0]?.count ?? 0;
  const nickname = p.profiles?.nickname ?? "anonimo";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <Link href="/" className="text-sm text-petrolio/60 hover:text-petrolio">← torna al feed</Link>

        <article className="card p-6">
          <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3">
            <span className="font-medium text-petrolio">@{nickname}</span>
            <span aria-hidden>·</span>
            <Link href={`/spazi/${p.space_slug}`} className="chip hover:bg-petrolio/15">
              {space?.name ?? p.space_slug}
            </Link>
            <span aria-hidden>·</span>
            <time dateTime={p.created_at}>{timeAgo(p.created_at)}</time>
            <ReportButton targetType="post" targetId={p.id} className="ml-auto shrink-0" />
          </header>

          <p className="whitespace-pre-wrap text-petrolio leading-relaxed text-[15px]">
            {p.content}
          </p>

          <footer className="mt-5">
            <MeTooButton postId={p.id} initialCount={meTooCount} initialActive={userMeToo} />
          </footer>
        </article>

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
