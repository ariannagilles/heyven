"use client";

import AtRiskBanner from "@/components/AtRiskBanner";
import ContentEditForm from "@/components/ContentEditForm";
import ContentMetaTime from "@/components/ContentMetaTime";
import EditContentButton from "@/components/EditContentButton";
import MeTooButton from "@/components/MeTooButton";
import ReportButton from "@/components/ReportButton";
import { useEditableContent } from "@/components/useEditableContent";
import Link from "next/link";
import { SPACE_BY_SLUG } from "@/lib/spaces";

type Props = {
  post: {
    id: string;
    author_id: string;
    content: string;
    created_at: string;
    updated_at: string | null;
    space_slug: string;
    at_risk: boolean;
    nickname: string;
  };
  viewerId: string | null;
  meTooCount: number;
  userMeToo: boolean;
};

export default function PostDetailArticle({
  post,
  viewerId,
  meTooCount,
  userMeToo,
}: Props) {
  const space = SPACE_BY_SLUG[post.space_slug];
  const editable = useEditableContent({
    table: "posts",
    id: post.id,
    authorId: post.author_id,
    viewerId,
    initialContent: post.content,
    initialUpdatedAt: post.updated_at,
    contentMaxLength: 500,
  });

  const showAtRiskBanner = Boolean(
    viewerId && post.at_risk && viewerId === post.author_id,
  );

  return (
    <article className="card p-6">
      {showAtRiskBanner && <AtRiskBanner />}
      <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3">
        <span className="font-medium text-petrolio">@{post.nickname}</span>
        <span aria-hidden>·</span>
        <Link href={`/spazi/${post.space_slug}`} className="chip hover:bg-petrolio/15">
          {space?.name ?? post.space_slug}
        </Link>
        <span aria-hidden>·</span>
        <ContentMetaTime createdAt={post.created_at} updatedAt={editable.updatedAt} />
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
          loading={editable.loading}
          error={editable.error}
          onSubmit={editable.saveEdit}
          onCancel={editable.cancelEdit}
        />
      ) : (
        <p className="whitespace-pre-wrap text-petrolio leading-relaxed text-[15px]">
          {editable.content}
        </p>
      )}

      {!editable.editing && (
        <footer className="mt-5">
          <MeTooButton
            postId={post.id}
            initialCount={meTooCount}
            initialActive={userMeToo}
          />
        </footer>
      )}
    </article>
  );
}
