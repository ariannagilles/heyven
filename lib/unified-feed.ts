import type { SupabaseClient } from "@supabase/supabase-js";

export type MixedFeedItem =
  | {
      kind: "sfogo";
      id: string;
      space_slug: string;
      nickname: string;
      content: string;
      created_at: string;
      reply_count: number;
      me_too_count: number;
      me_too: boolean;
    }
  | {
      kind: "domanda";
      id: string;
      space_slug: string;
      nickname: string;
      content: string;
      created_at: string;
      reply_count: number;
    }
  | {
      kind: "storia";
      id: string;
      space_slug: string;
      nickname: string;
      title: string | null;
      content: string;
      created_at: string;
      reaction_count: number;
      has_reacted: boolean;
    };

type RawPost = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
  replies: { count: number }[] | null;
  me_too: { count: number }[] | null;
};

type RawQuestion = {
  id: string;
  space_slug: string;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
  question_replies: { count: number }[] | null;
};

type RawStory = {
  id: string;
  space_slug: string;
  title: string | null;
  content: string;
  created_at: string;
  profiles: { nickname: string } | null;
  story_reactions: { count: number }[] | null;
};

export async function fetchUnifiedHomeFeed(
  supabase: SupabaseClient,
  userId: string,
  perTypeLimit = 30,
  totalLimit = 50,
): Promise<MixedFeedItem[]> {
  const [postsRes, questionsRes, storiesRes] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "id, space_slug, content, created_at, profiles(nickname), replies(count), me_too(count)",
      )
      .order("created_at", { ascending: false })
      .limit(perTypeLimit),
    supabase
      .from("questions")
      .select(
        "id, space_slug, content, created_at, profiles(nickname), question_replies(count)",
      )
      .order("created_at", { ascending: false })
      .limit(perTypeLimit),
    supabase
      .from("stories")
      .select(
        "id, space_slug, title, content, created_at, profiles(nickname), story_reactions(count)",
      )
      .order("created_at", { ascending: false })
      .limit(perTypeLimit),
  ]);

  const rawPosts = (postsRes.data as unknown as RawPost[]) ?? [];
  const rawQuestions = (questionsRes.data as unknown as RawQuestion[]) ?? [];
  const rawStories = (storiesRes.data as unknown as RawStory[]) ?? [];

  // Fetch user's me_too and story_reactions for the visible items
  const postIds = rawPosts.map((p) => p.id);
  const storyIds = rawStories.map((s) => s.id);

  const [myMeTooRes, myStoryReactRes] = await Promise.all([
    postIds.length > 0
      ? supabase
          .from("me_too")
          .select("post_id")
          .eq("user_id", userId)
          .in("post_id", postIds)
      : Promise.resolve({ data: [] as { post_id: string }[] }),
    storyIds.length > 0
      ? supabase
          .from("story_reactions")
          .select("story_id")
          .eq("user_id", userId)
          .in("story_id", storyIds)
      : Promise.resolve({ data: [] as { story_id: string }[] }),
  ]);

  const myMeTooSet = new Set(
    ((myMeTooRes.data ?? []) as { post_id: string }[]).map((r) => r.post_id),
  );
  const myStorySet = new Set(
    ((myStoryReactRes.data ?? []) as { story_id: string }[]).map((r) => r.story_id),
  );

  const items: MixedFeedItem[] = [
    ...rawPosts.map<MixedFeedItem>((p) => ({
      kind: "sfogo",
      id: p.id,
      space_slug: p.space_slug,
      nickname: p.profiles?.nickname ?? "anonimo",
      content: p.content,
      created_at: p.created_at,
      reply_count: p.replies?.[0]?.count ?? 0,
      me_too_count: p.me_too?.[0]?.count ?? 0,
      me_too: myMeTooSet.has(p.id),
    })),
    ...rawQuestions.map<MixedFeedItem>((q) => ({
      kind: "domanda",
      id: q.id,
      space_slug: q.space_slug,
      nickname: q.profiles?.nickname ?? "anonimo",
      content: q.content,
      created_at: q.created_at,
      reply_count: q.question_replies?.[0]?.count ?? 0,
    })),
    ...rawStories.map<MixedFeedItem>((s) => ({
      kind: "storia",
      id: s.id,
      space_slug: s.space_slug,
      nickname: s.profiles?.nickname ?? "anonimo",
      title: s.title,
      content: s.content,
      created_at: s.created_at,
      reaction_count: s.story_reactions?.[0]?.count ?? 0,
      has_reacted: myStorySet.has(s.id),
    })),
  ];

  items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return items.slice(0, totalLimit);
}
