import Link from "next/link";
import Avatar from "./Avatar";
import MeTooButton from "./MeTooButton";
import StoryReactionButton from "./StoryReactionButton";
import type { MixedFeedItem as Item } from "@/lib/unified-feed";
import { SPACE_BY_SLUG } from "@/lib/spaces";
import { timeAgo } from "@/lib/time";

const KIND_META: Record<Item["kind"], { emoji: string; label: string }> = {
  sfogo:   { emoji: "🌊", label: "Sfogo" },
  domanda: { emoji: "❓", label: "Domanda" },
  storia:  { emoji: "📖", label: "Storia" },
};

export default function MixedFeedItem({ item }: { item: Item }) {
  const space = SPACE_BY_SLUG[item.space_slug];
  const meta = KIND_META[item.kind];

  return (
    <article className="card p-5">
      <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-3 flex-wrap">
        <Avatar nickname={item.nickname} size={32} />
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
        <time dateTime={item.created_at}>{timeAgo(item.created_at)}</time>
      </header>

      {item.kind === "storia" && item.title && (
        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
      )}

      {item.kind === "sfogo" ? (
        <Link href={`/post/${item.id}`} className="block">
          <p className="whitespace-pre-wrap text-petrolio leading-relaxed line-clamp-6">
            {item.content}
          </p>
        </Link>
      ) : item.kind === "domanda" ? (
        <Link href={`/spazi/${item.space_slug}/domande/${item.id}`} className="block">
          <p className="whitespace-pre-wrap text-petrolio leading-relaxed">
            {item.content}
          </p>
        </Link>
      ) : (
        <Link href={`/spazi/${item.space_slug}/storie`} className="block">
          <p className="whitespace-pre-wrap text-petrolio leading-relaxed line-clamp-6">
            {item.content}
          </p>
        </Link>
      )}

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
            <span>{item.reply_count === 0 ? "Rispondi" : `${item.reply_count} rispost${item.reply_count === 1 ? "a" : "e"}`}</span>
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
    </article>
  );
}
