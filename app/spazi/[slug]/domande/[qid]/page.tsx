import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QuestionDetailArticle from "@/components/QuestionDetailArticle";
import Avatar from "@/components/Avatar";
import ReportButton from "@/components/ReportButton";
import ReplyForm from "./ReplyForm";
import { createClient } from "@/lib/supabase/server";
import { avatarDataUri } from "@/lib/avatar";
import { SPACE_BY_SLUG } from "@/lib/spaces";
import { getQuestion, getQuestionReplies } from "@/lib/space-content";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function QuestionDetailPage({
  params,
}: {
  params: { slug: string; qid: string };
}) {
  const space = SPACE_BY_SLUG[params.slug];
  if (!space) notFound();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}/domande/${params.qid}`);

  const question = await getQuestion(supabase, params.qid);
  if (!question || question.space_slug !== params.slug) notFound();

  const replies = await getQuestionReplies(supabase, params.qid);

  return (
    <div className="space-y-4">
      <Link
        href={`/spazi/${params.slug}/domande`}
        className="text-sm text-petrolio/60 hover:text-petrolio"
      >
        ← tutte le domande
      </Link>

      <QuestionDetailArticle
        question={{
          id: question.id,
          author_id: question.author_id,
          content: question.content,
          created_at: question.created_at,
          updated_at: question.updated_at,
          at_risk: question.at_risk,
          nickname: question.nickname,
          avatarSrc: avatarDataUri(question.nickname),
        }}
        viewerId={user.id}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-petrolio/70 px-1">
          {replies.length} rispost{replies.length === 1 ? "a" : "e"}
        </h2>

        {replies.length === 0 ? (
          <div className="card p-5 text-sm text-petrolio/70">
            Nessuna risposta ancora. Scrivere per primə richiede coraggio.
          </div>
        ) : (
          <ul className="space-y-2">
            {replies.map((r) => (
              <li key={r.id} className="card p-4">
                <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-1.5">
                  <Avatar nickname={r.nickname} size={28} />
                  <span className="font-medium text-petrolio">@{r.nickname}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={r.created_at}>{timeAgo(r.created_at)}</time>
                  <ReportButton
                    targetType="question_reply"
                    targetId={r.id}
                    className="ml-auto shrink-0"
                  />
                </header>
                <p className="text-petrolio leading-relaxed whitespace-pre-wrap">
                  {r.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ReplyForm questionId={params.qid} />
    </div>
  );
}
