import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedPost } from "@/components/PostCard";
import type { QuestionRow, StoryRow } from "@/lib/space-content";
import type { MixedFeedItem, UnifiedFeedCursor } from "@/lib/unified-feed";
import type { FeedCursor } from "@/lib/pagination";

export type SpaceFeedFilter = "tutto" | "sfogo" | "domanda" | "storia";

export const SPACE_FEED_FILTERS: { id: SpaceFeedFilter; label: string }[] = [
  { id: "tutto", label: "Tutto" },
  { id: "sfogo", label: "Sfoghi" },
  { id: "domanda", label: "Domande" },
  { id: "storia", label: "Storie" },
];

export type SpaceFeedCursor = UnifiedFeedCursor | FeedCursor;

export type SpaceFeedPage = {
  items: MixedFeedItem[];
  nextCursor: SpaceFeedCursor | null;
  hasMore: boolean;
};

export function postToMixedItem(post: FeedPost): MixedFeedItem {
  return {
    kind: "sfogo",
    id: post.id,
    author_id: post.author_id,
    space_slug: post.space_slug,
    nickname: post.nickname,
    content: post.content,
    created_at: post.created_at,
    edited_at: post.edited_at,
    reply_count: post.replyCount,
    me_too_count: post.meTooCount,
    me_too: post.meToo,
    avatarSrc: post.avatarSrc,
  };
}

export function questionToMixedItem(
  question: QuestionRow,
  spaceSlug: string,
): MixedFeedItem {
  return {
    kind: "domanda",
    id: question.id,
    author_id: question.author_id,
    space_slug: spaceSlug,
    nickname: question.nickname,
    content: question.content,
    created_at: question.created_at,
    edited_at: question.edited_at,
    reply_count: question.reply_count,
    avatarSrc: question.avatarSrc,
  };
}

export function storyToMixedItem(story: StoryRow, spaceSlug: string): MixedFeedItem {
  return {
    kind: "storia",
    id: story.id,
    author_id: story.author_id,
    space_slug: spaceSlug,
    nickname: story.nickname,
    title: story.title,
    content: story.content,
    created_at: story.created_at,
    edited_at: story.edited_at,
    reaction_count: story.reaction_count,
    has_reacted: story.has_reacted,
    avatarSrc: story.avatarSrc,
  };
}

export async function getSpacePeopleToday(
  supabase: SupabaseClient,
  spaceSlug: string,
): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const since = start.toISOString();

  const [postsRes, questionsRes, storiesRes] = await Promise.all([
    supabase
      .from("posts")
      .select("author_id")
      .eq("space_slug", spaceSlug)
      .gte("created_at", since),
    supabase
      .from("questions")
      .select("author_id")
      .eq("space_slug", spaceSlug)
      .gte("created_at", since),
    supabase
      .from("stories")
      .select("author_id")
      .eq("space_slug", spaceSlug)
      .gte("created_at", since),
  ]);

  const authors = new Set<string>();
  for (const row of [
    ...((postsRes.data ?? []) as { author_id: string }[]),
    ...((questionsRes.data ?? []) as { author_id: string }[]),
    ...((storiesRes.data ?? []) as { author_id: string }[]),
  ]) {
    authors.add(row.author_id);
  }

  return authors.size;
}

export function writeHrefForFilter(
  spaceSlug: string,
  filter: SpaceFeedFilter,
): string {
  const q = `?space=${encodeURIComponent(spaceSlug)}`;
  switch (filter) {
    case "sfogo":
      return `/new/sfogo${q}`;
    case "domanda":
      return `/new/domanda${q}`;
    case "storia":
      return `/new/storia${q}`;
    default:
      return `/new${q}`;
  }
}

export function parseSpaceFeedFilter(value: string | undefined): SpaceFeedFilter {
  if (value === "sfogo" || value === "sfoghi") return "sfogo";
  if (value === "domanda" || value === "domande") return "domanda";
  if (value === "storia" || value === "storie") return "storia";
  return "tutto";
}
