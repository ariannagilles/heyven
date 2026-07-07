import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationType = "reply" | "me_too";
export type NotificationTargetType = "post" | "question" | "story";

export type NotificationRow = {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  target_type: NotificationTargetType;
  target_id: string;
  reply_id: string | null;
  count: number;
  read: boolean;
  created_at: string;
  actor_nickname: string | null;
  space_slug: string | null;
  target_preview: string | null;
};

type NotificationSelectRow = {
  id: string;
  recipient_id: string;
  actor_id: string;
  type: NotificationType;
  target_type: NotificationTargetType;
  target_id: string;
  reply_id: string | null;
  count: number;
  read: boolean;
  created_at: string;
  actor: { nickname: string } | { nickname: string }[] | null;
};

const PREVIEW_MAX = 60;

export function truncateTargetPreview(content: string, maxLen = PREVIEW_MAX): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLen) return normalized;
  return `${normalized.slice(0, maxLen - 3).trimEnd()}...`;
}

function actorNickname(
  actor: NotificationSelectRow["actor"],
): string | null {
  if (!actor) return null;
  const row = Array.isArray(actor) ? actor[0] : actor;
  return row?.nickname ?? null;
}

function uniqueIds(rows: NotificationSelectRow[], targetType: NotificationTargetType): string[] {
  return [
    ...new Set(
      rows
        .filter((r) => r.target_type === targetType)
        .map((r) => r.target_id),
    ),
  ];
}

/** Batch: fino a 3 select in parallelo (posts + questions + stories), mai una per notifica. */
async function fetchTargetMetaByTargetId(
  supabase: SupabaseClient,
  rows: NotificationSelectRow[],
): Promise<{
  slugByTargetId: Map<string, string>;
  previewByTargetId: Map<string, string>;
}> {
  const slugByTargetId = new Map<string, string>();
  const previewByTargetId = new Map<string, string>();

  const postIds = uniqueIds(rows, "post");
  const questionIds = uniqueIds(rows, "question");
  const storyIds = uniqueIds(rows, "story");

  if (postIds.length === 0 && questionIds.length === 0 && storyIds.length === 0) {
    return { slugByTargetId, previewByTargetId };
  }

  const [postsRes, questionsRes, storiesRes] = await Promise.all([
    postIds.length > 0
      ? supabase.from("posts").select("id, content").in("id", postIds)
      : Promise.resolve({ data: [] as { id: string; content: string }[] }),
    questionIds.length > 0
      ? supabase.from("questions").select("id, space_slug, content").in("id", questionIds)
      : Promise.resolve({ data: [] as { id: string; space_slug: string; content: string }[] }),
    storyIds.length > 0
      ? supabase.from("stories").select("id, space_slug, content").in("id", storyIds)
      : Promise.resolve({ data: [] as { id: string; space_slug: string; content: string }[] }),
  ]);

  for (const row of postsRes.data ?? []) {
    previewByTargetId.set(row.id, truncateTargetPreview(row.content));
  }
  for (const row of questionsRes.data ?? []) {
    slugByTargetId.set(row.id, row.space_slug);
    previewByTargetId.set(row.id, truncateTargetPreview(row.content));
  }
  for (const row of storiesRes.data ?? []) {
    slugByTargetId.set(row.id, row.space_slug);
    previewByTargetId.set(row.id, truncateTargetPreview(row.content));
  }

  return { slugByTargetId, previewByTargetId };
}

export const getUnreadNotificationsCount = cache(
  async (supabase: SupabaseClient): Promise<number> => {
    const { data, error } = await supabase.rpc("get_unread_notifications_count");
    if (error) return 0;
    return (data as number) ?? 0;
  },
);

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      recipient_id,
      actor_id,
      type,
      target_type,
      target_id,
      reply_id,
      count,
      read,
      created_at,
      actor:profiles!notifications_actor_id_fkey(nickname)
    `,
    )
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data?.length) return [];

  const rows = data as NotificationSelectRow[];
  const { slugByTargetId, previewByTargetId } = await fetchTargetMetaByTargetId(
    supabase,
    rows,
  );

  return rows.map((row) => ({
    id: row.id,
    recipient_id: row.recipient_id,
    actor_id: row.actor_id,
    type: row.type,
    target_type: row.target_type,
    target_id: row.target_id,
    reply_id: row.reply_id,
    count: row.count,
    read: row.read,
    created_at: row.created_at,
    actor_nickname: actorNickname(row.actor),
    space_slug:
      row.target_type === "question" || row.target_type === "story"
        ? slugByTargetId.get(row.target_id) ?? null
        : null,
    target_preview: previewByTargetId.get(row.target_id) ?? null,
  }));
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_id", userId)
    .eq("read", false);
}

export function notificationText(n: NotificationRow): string {
  if (n.type === "reply" && n.target_type === "post") {
    return "Qualcuno ha risposto al tuo sfogo";
  }
  if (n.type === "reply" && n.target_type === "question") {
    return "Qualcuno ha risposto alla tua domanda";
  }
  if (n.type === "me_too") {
    if (n.count > 1) {
      return `A ${n.count} persone è capitata la stessa cosa che hai scritto`;
    }
    return "A qualcuno è capitata la stessa cosa che hai scritto";
  }
  return "Hai una nuova notifica";
}

export function notificationHref(n: NotificationRow): string {
  if (n.target_type === "post") return `/post/${n.target_id}`;
  if (n.target_type === "question" && n.space_slug) {
    return `/spazi/${n.space_slug}/domande/${n.target_id}`;
  }
  if (n.target_type === "story" && n.space_slug) {
    return `/spazi/${n.space_slug}/storie`;
  }
  return "/";
}
