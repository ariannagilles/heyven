"use client";

import AtRiskBanner from "@/components/AtRiskBanner";
import { AvatarImage } from "@/components/AvatarImage";
import ContentEditForm from "@/components/ContentEditForm";
import ContentMetaTime from "@/components/ContentMetaTime";
import EditContentButton from "@/components/EditContentButton";
import ReportButton from "@/components/ReportButton";
import StoryReactionButton from "@/components/StoryReactionButton";
import { useEditableContent } from "@/components/useEditableContent";
import type { StoryRow } from "@/lib/space-content";

type Props = {
  story: StoryRow;
  viewerId: string;
};

export default function StoryListItem({ story, viewerId }: Props) {
  const editable = useEditableContent({
    table: "stories",
    id: story.id,
    authorId: story.author_id,
    viewerId,
    initialContent: story.content,
    initialTitle: story.title,
    initialUpdatedAt: story.updated_at,
  });

  const showAtRiskBanner = Boolean(story.at_risk && viewerId === story.author_id);

  return (
    <li className="card p-5">
      {showAtRiskBanner && <AtRiskBanner />}
      <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3">
        <AvatarImage src={story.avatarSrc} nickname={story.nickname} size={32} />
        <span className="font-medium text-petrolio">@{story.nickname}</span>
        <span aria-hidden>·</span>
        <ContentMetaTime createdAt={story.created_at} updatedAt={editable.updatedAt} />
        <div className="ml-auto shrink-0 flex items-center gap-0.5">
          {editable.canEdit && !editable.editing && (
            <EditContentButton onClick={editable.startEdit} />
          )}
          <ReportButton targetType="story" targetId={story.id} />
        </div>
      </header>

      {editable.editing ? (
        <ContentEditForm
          contentLabel="La tua storia"
          content={editable.draftContent}
          onContentChange={editable.setDraftContent}
          title={editable.draftTitle}
          onTitleChange={editable.setDraftTitle}
          showTitle
          loading={editable.loading}
          error={editable.error}
          onSubmit={editable.saveEdit}
          onCancel={editable.cancelEdit}
          textareaClassName="min-h-[260px]"
        />
      ) : (
        <>
          {editable.title && (
            <h3 className="text-lg font-semibold mb-2">{editable.title}</h3>
          )}
          <p className="text-[15px] text-petrolio leading-relaxed whitespace-pre-wrap">
            {editable.content}
          </p>
        </>
      )}

      {!editable.editing && (
        <footer className="mt-4">
          <StoryReactionButton
            storyId={story.id}
            initialCount={story.reaction_count}
            initialActive={story.has_reacted}
          />
        </footer>
      )}
    </li>
  );
}
