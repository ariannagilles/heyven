"use client";

import Link from "next/link";
import MeTooButton from "@/components/MeTooButton";
import ReportButton from "@/components/ReportButton";
import ContentEditForm from "@/components/ContentEditForm";
import ContentMetaTime from "@/components/ContentMetaTime";
import EditContentButton from "@/components/EditContentButton";
import { AvatarImage } from "@/components/AvatarImage";
import { useEditableContent } from "@/components/useEditableContent";
import type { FeedPost } from "@/components/PostCard";
import { SPACE_BY_SLUG } from "@/lib/spaces";

type Props = {
  post: FeedPost;
  viewerId: string;
};

export default function PostCardClient({ post, viewerId }: Props) {
  const space = SPACE_BY_SLUG[post.space_slug];
  const editable = useEditableContent({
    table: "posts",
    id: post.id,
    authorId: post.author_id,
    viewerId,
    initialContent: post.content,
    initialEditedAt: post.edited_at,
    replyCount: post.replyCount,
    reactionCount: post.meTooCount,
    contentMaxLength: 500,
  });

  return (
    <article className="card p-5">
      <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3">
        <AvatarImage src={post.avatarSrc} nickname={post.nickname} size={32} />
        <span className="font-medium text-petrolio">@{post.nickname}</span>
        <span aria-hidden>·</span>
        <Link href={`/spazi/${post.space_slug}`} className="chip hover:bg-petrolio/15">
          {space?.name ?? post.space_slug}
        </Link>
        <span aria-hidden>·</span>
        <ContentMetaTime createdAt={post.created_at} editedAt={editable.editedAt} />
        <div className="ml-auto shrink-0 flex items-center gap-0.5">
          {editable.canEdit && !editable.editing && (
            <EditContentButton onClick={editable.startEdit} />
          )}
          <ReportButton targetType="post" targetId={post.id} />
        </div>
      </header>

      {editable.editing ? (
        <ContentEditForm
          contentLabel="Il tuo sfogo"
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
        <Link href={`/post/${post.id}`} className="block">
          <p className="whitespace-pre-wrap text-petrolio leading-relaxed line-clamp-6">
            {editable.content}
          </p>
        </Link>
      )}

      {!editable.editing && (
        <footer className="mt-4 flex items-center gap-2">
          <MeTooButton
            postId={post.id}
            initialCount={post.meTooCount}
            initialActive={post.meToo}
          />
          <Link
            href={`/post/${post.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-petrolio/5 text-petrolio px-3 py-1.5 text-sm hover:bg-petrolio/10"
          >
            <span aria-hidden>💬</span>
            <span>risposte</span>
            <span className="tabular-nums opacity-80">{post.replyCount}</span>
          </Link>
        </footer>
      )}
    </article>
  );
}
