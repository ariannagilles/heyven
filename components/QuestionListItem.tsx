"use client";

import Link from "next/link";
import { AvatarImage } from "@/components/AvatarImage";
import ContentEditForm from "@/components/ContentEditForm";
import ContentMetaTime from "@/components/ContentMetaTime";
import EditContentButton from "@/components/EditContentButton";
import ReportButton from "@/components/ReportButton";
import { useEditableContent } from "@/components/useEditableContent";
import type { QuestionRow } from "@/lib/space-content";

type Props = {
  question: QuestionRow;
  spaceSlug: string;
  viewerId: string;
};

export default function QuestionListItem({ question, spaceSlug, viewerId }: Props) {
  const editable = useEditableContent({
    table: "questions",
    id: question.id,
    authorId: question.author_id,
    viewerId,
    initialContent: question.content,
    initialUpdatedAt: question.updated_at,
    contentMaxLength: 500,
  });

  return (
    <li className="card p-4">
      <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-2">
        <AvatarImage src={question.avatarSrc} nickname={question.nickname} size={28} />
        <span className="font-medium text-petrolio">@{question.nickname}</span>
        <span aria-hidden>·</span>
        <ContentMetaTime
          createdAt={question.created_at}
          updatedAt={editable.updatedAt}
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
          loading={editable.loading}
          error={editable.error}
          onSubmit={editable.saveEdit}
          onCancel={editable.cancelEdit}
        />
      ) : (
        <p className="text-petrolio leading-relaxed whitespace-pre-wrap">
          {editable.content}
        </p>
      )}

      {!editable.editing && (
        <footer className="mt-3 flex items-center justify-between gap-2">
          <span className="text-sm text-petrolio/70">
            {question.reply_count} rispost{question.reply_count === 1 ? "a" : "e"}
          </span>
          <Link
            href={`/spazi/${spaceSlug}/domande/${question.id}`}
            className="btn-outline text-sm"
          >
            Rispondi
          </Link>
        </footer>
      )}
    </li>
  );
}
