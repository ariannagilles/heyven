import Link from "next/link";
import { AvatarImage } from "@/components/AvatarImage";
import type { MixedFeedItem } from "@/lib/unified-feed";

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
  if (item.kind === "domanda") return `/spazi/${item.space_slug}/domande/${item.id}`;
  return `/spazi/${item.space_slug}/storie`;
}

function reactionCount(item: MixedFeedItem): number {
  if (item.kind === "sfogo") return item.me_too_count;
  if (item.kind === "storia") return item.reaction_count;
  return item.reply_count;
}

function reactionLabel(item: MixedFeedItem): string {
  return item.kind === "domanda" ? "Risposte" : "Anch'io";
}

function reactionEmoji(item: MixedFeedItem): string {
  return item.kind === "domanda" ? "💬" : "❤";
}

export default function HomeFeedCard({ item }: Props) {
  const meta = KIND_META[item.kind];
  const href = itemHref(item);
  const displayText =
    item.kind === "storia" && item.title
      ? `${item.title}\n${item.content}`
      : item.content;

  return (
    <Link href={href} className="glass-card block p-4 transition-colors hover:bg-cream/[0.12]">
      <header className="mb-3 flex items-center gap-2">
        <AvatarImage src={item.avatarSrc} nickname={item.nickname} size={26} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-cream">
          @{item.nickname}
        </span>
        <span className="shrink-0 text-xs text-cream/50">
          {meta.emoji} {meta.label}
        </span>
      </header>

      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-cream/90 line-clamp-6">
        {displayText}
      </p>

      <footer className="mt-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-3 py-1.5 text-xs font-medium text-mint">
          <span aria-hidden>{reactionEmoji(item)}</span>
          <span>
            {reactionLabel(item)} · {reactionCount(item)}
          </span>
        </span>
      </footer>
    </Link>
  );
}
