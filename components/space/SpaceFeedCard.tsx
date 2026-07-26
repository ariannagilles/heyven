import Link from "next/link";
import { AvatarImage } from "@/components/AvatarImage";
import type { MixedFeedItem } from "@/lib/unified-feed";
import { timeAgo } from "@/lib/time";

const KIND_META: Record<MixedFeedItem["kind"], { emoji: string; label: string }> = {
  sfogo: { emoji: "🌊", label: "Sfogo" },
  domanda: { emoji: "❓", label: "Domanda" },
  storia: { emoji: "📖", label: "Storia" },
};

type Props = {
  item: MixedFeedItem;
};

function itemHref(item: MixedFeedItem): string {
  if (item.kind === "sfogo") return `/post/${item.id}`;
  if (item.kind === "domanda") {
    return `/spazi/${item.space_slug}/domande/${item.id}`;
  }
  return `/spazi/${item.space_slug}/storie`;
}

function meTooCount(item: MixedFeedItem): number {
  if (item.kind === "sfogo") return item.me_too_count;
  if (item.kind === "storia") return item.reaction_count;
  return 0;
}

function replyCount(item: MixedFeedItem): number {
  if (item.kind === "sfogo" || item.kind === "domanda") return item.reply_count;
  return 0;
}

export default function SpaceFeedCard({ item }: Props) {
  const meta = KIND_META[item.kind];
  const href = itemHref(item);
  const displayText =
    item.kind === "storia" && item.title
      ? `${item.title}\n${item.content}`
      : item.content;
  const clampClass = item.kind === "storia" ? "line-clamp-4" : "";

  return (
    <Link
      href={href}
      className="glass-card mb-[11px] block p-4 transition-transform active:scale-[0.98]"
    >
      <header className="mb-3 flex items-center gap-2">
        <AvatarImage
          src={item.avatarSrc}
          nickname={item.nickname}
          size={26}
          className="rounded-lg"
        />
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-cream">
          @{item.nickname}
        </span>
        <span className="shrink-0 text-[11px] text-cream/50">
          {meta.emoji} {meta.label}
        </span>
      </header>

      <p
        className={`whitespace-pre-wrap text-[14px] leading-[1.55] text-cream/90 ${clampClass}`}
      >
        {displayText}
      </p>

      <footer className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-2.5 py-1 text-[11px] font-medium text-mint">
          <span aria-hidden>❤</span>
          <span>
            Anch&apos;io · {meTooCount(item)}
          </span>
        </span>
        <span className="text-[11px] text-cream/50 tabular-nums">
          💬 {replyCount(item)} · {timeAgo(item.created_at)}
        </span>
      </footer>
    </Link>
  );
}
