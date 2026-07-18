"use client";

import Link from "next/link";
import ContentEditForm from "@/components/ContentEditForm";
import ContentMetaTime from "@/components/ContentMetaTime";
import EditContentButton from "@/components/EditContentButton";
import MeTooButton from "@/components/MeTooButton";
import ReportButton from "@/components/ReportButton";
import StoryReactionButton from "@/components/StoryReactionButton";
import { AvatarImage } from "@/components/AvatarImage";
import { useEditableContent } from "@/components/useEditableContent";
import type { MixedFeedItem } from "@/lib/unified-feed";
import { SPACE_BY_SLUG } from "@/lib/spaces";

const KIND_META: Record<MixedFeedItem["kind"], { emoji: string; label: string }> = {
  sfogo: { emoji: "🌊", label: "Sfogo" },
  domanda: { emoji: "❓", label: "Domanda" },
  storia: { emoji: "📖", label: "Storia" },
};

type Props = {
  item: MixedFeedItem;
  viewerId: string | null;
};

export default function MixedFeedItemClient({ item, viewerId }: Props) {
  const space = SPACE_BY_SLUG[item.space_slug];
  const meta = KIND_META[item.kind];

  const editable = useEditableContent({
    table: item.kind === "sfogo" ? "posts" : item.kind === "domanda" ? "questions" : "stories",
    id: item.id,
    authorId: item.author_id,
    viewerId,
    initialContent: item.content,
    initialTitle: item.kind === "storia" ? item.title : null,
    initialUpdatedAt: item.updated_at,
    contentMaxLength: item.kind === "storia" ? undefined : 500,
  });

  const reportTargetType =
    item.kind === "sfogo" ? "post" : item.kind === "domanda" ? "question" : "story";

  return (
    <article className="card p-5">
      <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3 flex-wrap">
        <AvatarImage src={item.avatarSrc} nickname={item.nickname} size={32} />
        <span className="font-medium text-petrolio">@{item.nickname}</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>{meta.emoji}</span>
          <span>{meta.label}</span>
        </span>
        <span aria-hidden>·</span>
        <Link href={`/spazi/${item.space_slug}`} className="chip hover:bg-petrolio/15">
          {space?.name ?? item.space_slug}
        </Link>
        <span aria-hidden>·</span>
        <ContentMetaTime createdAt={item.created_at} updatedAt={editable.updatedAt} />
        <div className="ml-auto shrink-0 flex items-center gap-0.5">
          {editable.canEdit && !editable.editing && (
            <EditContentButton onClick={editable.startEdit} />
          )}
          <ReportButton targetType={reportTargetType} targetId={item.id} />
        </div>
      </header>

      {editable.editing ? (
        <ContentEditForm
          contentLabel={
            item.kind === "sfogo"
              ? "Il tuo sfogo"
              : item.kind === "domanda"
                ? "La tua domanda"
                : "La tua storia"
          }
          content={editable.draftContent}
          onContentChange={editable.setDraftContent}
          contentMaxLength={item.kind === "storia" ? undefined : 500}
          title={editable.draftTitle}
          onTitleChange={editable.setDraftTitle}
          showTitle={item.kind === "storia"}
          loading={editable.loading}
          error={editable.error}
          onSubmit={editable.saveEdit}
          onCancel={editable.cancelEdit}
          textareaClassName={item.kind === "storia" ? "min-h-[260px]" : "min-h-[160px]"}
        />
      ) : (
        <>
          {item.kind === "storia" && editable.title && (
            <h3 className="text-lg font-semibold mb-2">{editable.title}</h3>
          )}

          {item.kind === "sfogo" ? (
            <Link href={`/post/${item.id}`} className="block">
              <p className="whitespace-pre-wrap text-petrolio leading-relaxed line-clamp-6">
                {editable.content}
              </p>
            </Link>
          ) : item.kind === "domanda" ? (
            <Link href={`/spazi/${item.space_slug}/domande/${item.id}`} className="block">
              <p className="whitespace-pre-wrap text-petrolio leading-relaxed">
                {editable.content}
              </p>
            </Link>
          ) : (
            <Link href={`/spazi/${item.space_slug}/storie`} className="block">
              <p className="whitespace-pre-wrap text-petrolio leading-relaxed line-clamp-6">
                {editable.content}
              </p>
            </Link>
          )}
        </>
      )}

      {!editable.editing && (
        <footer className="mt-4 flex items-center gap-2 flex-wrap">
          {item.kind === "sfogo" && (
            <>
              <MeTooButton
                postId={item.id}
                initialCount={item.me_too_count}
                initialActive={item.me_too}
              />
              <Link
                href={`/post/${item.id}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-petrolio/5 text-petrolio px-3 py-1.5 text-sm hover:bg-petrolio/10"
              >
                <span aria-hidden>💬</span>
                <span>risposte</span>
                <span className="tabular-nums opacity-80">{item.reply_count}</span>
              </Link>
            </>
          )}
          {item.kind === "domanda" && (
            <Link
              href={`/spazi/${item.space_slug}/domande/${item.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-petrolio/5 text-petrolio px-3 py-1.5 text-sm hover:bg-petrolio/10"
            >
              <span aria-hidden>💬</span>
              <span>
                {item.reply_count === 0
                  ? "Rispondi"
                  : `${item.reply_count} rispost${item.reply_count === 1 ? "a" : "e"}`}
              </span>
            </Link>
          )}
          {item.kind === "storia" && (
            <StoryReactionButton
              storyId={item.id}
              initialCount={item.reaction_count}
              initialActive={item.has_reacted}
            />
          )}
        </footer>
      )}
    </article>
  );
}
