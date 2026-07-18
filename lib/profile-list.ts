import type {
  OwnPostRow,
  OwnQuestionRow,
  OwnStoryRow,
} from "@/lib/profile";

export type ProfileTab = "sfoghi" | "domande" | "storie";

export type ProfileListItem = {
  id: string;
  href: string;
  spaceSlug: string;
  created_at: string;
  updated_at: string | null;
  snippet: string;
  interactions: string;
};

export function mapOwnPost(p: OwnPostRow): ProfileListItem {
  return {
    id: p.id,
    href: `/post/${p.id}`,
    spaceSlug: p.space_slug,
    created_at: p.created_at,
    updated_at: p.updated_at,
    snippet: p.content,
    interactions: `${p.me_too_count} anch'io · ${p.reply_count} rispost${p.reply_count === 1 ? "a" : "e"}`,
  };
}

export function mapOwnQuestion(q: OwnQuestionRow): ProfileListItem {
  return {
    id: q.id,
    href: `/spazi/${q.space_slug}/domande/${q.id}`,
    spaceSlug: q.space_slug,
    created_at: q.created_at,
    updated_at: q.updated_at,
    snippet: q.content,
    interactions: `${q.reply_count} rispost${q.reply_count === 1 ? "a" : "e"}`,
  };
}

export function mapOwnStory(s: OwnStoryRow): ProfileListItem {
  return {
    id: s.id,
    href: `/spazi/${s.space_slug}/storie`,
    spaceSlug: s.space_slug,
    created_at: s.created_at,
    updated_at: s.updated_at,
    snippet: s.title || s.content,
    interactions: `${s.reaction_count} anch'io`,
  };
}
