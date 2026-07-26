import { notFound, redirect } from "next/navigation";
import ContentDetailBody from "@/components/content/ContentDetailBody";
import ContentDetailChrome from "@/components/content/ContentDetailChrome";
import ContentDetailHeader, {
  contentDetailTitle,
} from "@/components/content/ContentDetailHeader";
import ContentReplyList from "@/components/content/ContentReplyList";
import ReactionBar from "@/components/content/ReactionBar";
import ReplyForm from "./ReplyForm";
import { createClient } from "@/lib/supabase/server";
import { SPACE_BY_SLUG } from "@/lib/spaces";
import { getQuestion, getQuestionReplies } from "@/lib/space-content";

export const dynamic = "force-dynamic";

export default async function QuestionDetailPage({
  params,
}: {
  params: { slug: string; qid: string };
}) {
  const space = SPACE_BY_SLUG[params.slug];
  if (!space) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}/domande/${params.qid}`);

  const question = await getQuestion(supabase, params.qid);
  if (!question || question.space_slug !== params.slug) notFound();

  const replies = await getQuestionReplies(supabase, params.qid);
  const isAuthor = user.id === question.author_id;

  return (
    <ContentDetailChrome
      replyForm={<ReplyForm questionId={params.qid} />}
      reactionBar={<ReactionBar kind="domanda" />}
    >
      <ContentDetailHeader
        backHref={`/spazi/${params.slug}?tipo=domanda`}
        title={contentDetailTitle("domanda", isAuthor)}
      />
      <ContentDetailBody
        kind="domanda"
        id={question.id}
        authorId={question.author_id}
        viewerId={user.id}
        content={question.content}
        createdAt={question.created_at}
        editedAt={question.edited_at}
        atRisk={question.at_risk}
        replyCount={replies.length}
      />
      <ContentReplyList
        replies={replies.map((r) => ({
          id: r.id,
          content: r.content,
          nickname: r.nickname,
          reportTargetType: "question_reply" as const,
        }))}
        emptyMessage="Nessuna risposta ancora. Scrivere per primə richiede coraggio."
      />
    </ContentDetailChrome>
  );
}
