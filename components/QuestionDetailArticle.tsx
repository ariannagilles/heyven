"use client";

import AtRiskBanner from "@/components/AtRiskBanner";
import { AvatarImage } from "@/components/AvatarImage";
import ContentEditForm from "@/components/ContentEditForm";
import ContentMetaTime from "@/components/ContentMetaTime";
import EditContentButton from "@/components/EditContentButton";
import ReportButton from "@/components/ReportButton";
import { useEditableContent } from "@/components/useEditableContent";

type Props = {
  question: {
    id: string;
    author_id: string;
    content: string;
    created_at: string;
    edited_at: string | null;
    at_risk: boolean;
    nickname: string;
    avatarSrc: string;
  };
  viewerId: string | null;
  replyCount: number;
};

export default function QuestionDetailArticle({
  question,
  viewerId,
  replyCount,
}: Props) {
  const editable = useEditableContent({
    table: "questions",
    id: question.id,
    authorId: question.author_id,
    viewerId,
    initialContent: question.content,
    initialEditedAt: question.edited_at,
    replyCount,
    contentMaxLength: 500,
  });

  const showAtRiskBanner = Boolean(
    viewerId && question.at_risk && viewerId === question.author_id,
  );

  return (
    <article className="card p-5">
      {showAtRiskBanner && <AtRiskBanner />}
      <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3">
        <AvatarImage src={question.avatarSrc} nickname={question.nickname} size={32} />
        <span className="font-medium text-petrolio">@{question.nickname}</span>
        <span aria-hidden>·</span>
        <ContentMetaTime
          createdAt={question.created_at}
          editedAt={editable.editedAt}
        />
        <div className="ml-auto shrink-0 flex items-center gap-0.5">
          {editable.canEdit && !editable.editing && (
            <EditContentButton onClick={editable.startEdit} />
          )}
          <ReportButton targetType="question" targetId={question.id} />
        </div>
      </header>

      {editable.editing ? (
        <ContentEditForm
          contentLabel="La tua domanda"
          content={editable.draftContent}
          onContentChange={editable.setDraftContent}
          contentMaxLength={500}
          showReplyWarning={editable.hasReplies}
          loading={editable.loading}
          error={editable.error}
          onSubmit={editable.saveEdit}
          onCancel={editable.cancelEdit}
        />
      ) : (
        <p className="text-[15px] text-petrolio leading-relaxed whitespace-pre-wrap">
          {editable.content}
        </p>
      )}
    </article>
  );
}
