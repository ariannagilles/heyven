import Link from "next/link";
import MeTooButton from "./MeTooButton";
import ReportButton from "./ReportButton";
import Avatar from "./Avatar";
import { SPACE_BY_SLUG } from "@/lib/spaces";
import { timeAgo } from "@/lib/time";

export type FeedPost = {
  id: string;
  content: string;
  created_at: string;
  space_slug: string;
  nickname: string;
  replyCount: number;
  meTooCount: number;
  meToo: boolean;
};

export default function PostCard({ post }: { post: FeedPost }) {
  const space = SPACE_BY_SLUG[post.space_slug];
  return (
    <article className="card p-5">
      <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3">
        <Avatar nickname={post.nickname} size={32} />
        <span className="font-medium text-petrolio">@{post.nickname}</span>
        <span aria-hidden>·</span>
        <Link href={`/spazi/${post.space_slug}`} className="chip hover:bg-petrolio/15">
          {space?.name ?? post.space_slug}
        </Link>
        <span aria-hidden>·</span>
        <time dateTime={post.created_at}>{timeAgo(post.created_at)}</time>
        <ReportButton targetType="post" targetId={post.id} className="ml-auto shrink-0" />
      </header>

      <Link href={`/post/${post.id}`} className="block">
        <p className="whitespace-pre-wrap text-petrolio leading-relaxed line-clamp-6">
          {post.content}
        </p>
      </Link>

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
    </article>
  );
}
