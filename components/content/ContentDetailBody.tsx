"use client";

import AtRiskBanner from "@/components/AtRiskBanner";
import ContentEditForm from "@/components/ContentEditForm";
import ContentMetaTime from "@/components/ContentMetaTime";
import EditContentButton from "@/components/EditContentButton";
import ReportButton from "@/components/ReportButton";
import { useEditableContent } from "@/components/useEditableContent";
import type { ContentKind } from "@/components/content/ContentDetailHeader";

type Props = {
  kind: ContentKind;
  id: string;
  authorId: string;
  viewerId: string | null;
  content: string;
  title?: string | null;
  createdAt: string;
  editedAt: string | null;
  atRisk: boolean;
  replyCount?: number;
  reactionCount?: number;
  nickname?: string;
  showMeta?: boolean;
};

export default function ContentDetailBody({
  kind,
  id,
  authorId,
  viewerId,
  content,
  title = null,
  createdAt,
  editedAt,
  atRisk,
  replyCount = 0,
  reactionCount = 0,
  nickname,
  showMeta = false,
}: Props) {
  const table = kind === "sfogo" ? "posts" : kind === "domanda" ? "questions" : "stories";

  const editable = useEditableContent({
    table,
    id,
    authorId,
    viewerId,
    initialContent: content,
    initialTitle: kind === "storia" ? title : null,
    initialEditedAt: editedAt,
    replyCount,
    reactionCount,
    contentMaxLength: kind === "storia" ? undefined : 500,
  });

  const showAtRiskBanner = Boolean(viewerId && atRisk && viewerId === authorId);

  const contentLabel =
    kind === "sfogo"
      ? "Il tuo sfogo"
      : kind === "domanda"
        ? "La tua domanda"
        : "La tua storia";

  return (
    <article className="glass-card p-5">
      {showAtRiskBanner && <AtRiskBanner />}

      {showMeta && nickname && (
        <header className="mb-3 flex items-center gap-2 text-xs text-cream/60">
          <span className="font-medium text-cream">@{nickname}</span>
          <span aria-hidden>·</span>
          <ContentMetaTime createdAt={createdAt} editedAt={editable.editedAt} />
          <div className="ml-auto shrink-0 flex items-center gap-0.5">
            {editable.canEdit && !editable.editing && (
              <EditContentButton onClick={editable.startEdit} />
            )}
            <ReportButton
              targetType={kind === "sfogo" ? "post" : kind === "domanda" ? "question" : "story"}
              targetId={id}
            />
          </div>
        </header>
      )}

      {!showMeta && editable.canEdit && !editable.editing && (
        <div className="mb-3 flex justify-end">
          <EditContentButton onClick={editable.startEdit} />
        </div>
      )}

      {editable.editing ? (
        <ContentEditForm
          contentLabel={contentLabel}
          content={editable.draftContent}
          onContentChange={editable.setDraftContent}
          contentMaxLength={kind === "storia" ? undefined : 500}
          title={editable.draftTitle}
          onTitleChange={editable.setDraftTitle}
          showTitle={kind === "storia"}
          showReplyWarning={editable.hasReplies}
          loading={editable.loading}
          error={editable.error}
          onSubmit={editable.saveEdit}
          onCancel={editable.cancelEdit}
          textareaClassName={kind === "storia" ? "min-h-[260px]" : "min-h-[160px]"}
        />
      ) : (
        <>
          {kind === "storia" && editable.title && (
            <h2 className="mb-2 text-lg font-semibold text-cream">{editable.title}</h2>
          )}
          <p className="whitespace-pre-wrap text-[15.5px] leading-[1.55] text-cream">
            {editable.content}
          </p>
        </>
      )}
    </article>
  );
}
