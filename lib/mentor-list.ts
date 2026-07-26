import type { SupabaseClient } from "@supabase/supabase-js";
import { avatarDataUri } from "@/lib/avatar";
import { detectAtRisk } from "@/lib/at-risk";
import { getProfile } from "@/lib/chat";
import type { ConversationListItem } from "@/lib/mentor-list-types";

export type { ConversationListItem } from "@/lib/mentor-list-types";

type MessageRow = {
  conversation_id: string;
  content: string;
  created_at: string;
  sender_id: string;
};

type ConversationRow = {
  id: string;
  mentor_id: string;
  status: "active" | "closed";
  created_at: string;
  closed_at?: string | null;
};

async function enrichConversations(
  supabase: SupabaseClient,
  rows: ConversationRow[],
  options?: { checkAtRisk?: boolean },
): Promise<ConversationListItem[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const { data: messageRows } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at, sender_id")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false });

  const messages = (messageRows as MessageRow[] | null) ?? [];
  const lastByConv = new Map<string, MessageRow>();
  const lastMentorByConv = new Map<string, MessageRow>();

  for (const m of messages) {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, m);
    }
    const row = rows.find((r) => r.id === m.conversation_id);
    if (
      row &&
      m.sender_id === row.mentor_id &&
      !lastMentorByConv.has(m.conversation_id)
    ) {
      lastMentorByConv.set(m.conversation_id, m);
    }
  }

  const mentorProfiles = await Promise.all(
    rows.map(async (row) => {
      const profile = await getProfile(supabase, row.mentor_id);
      return [row.id, profile?.nickname ?? "mentore"] as const;
    }),
  );
  const mentorNicknames = new Map(mentorProfiles);

  const senderIds = [
    ...new Set([...lastByConv.values()].map((m) => m.sender_id)),
  ];
  const senderNicknames = new Map<string, string>();
  await Promise.all(
    senderIds.map(async (sid) => {
      const profile = await getProfile(supabase, sid);
      if (profile) senderNicknames.set(sid, profile.nickname);
    }),
  );

  const atRiskByConv = new Map<string, boolean>();
  if (options?.checkAtRisk && ids.length > 0) {
    const { data: allContents } = await supabase
      .from("messages")
      .select("conversation_id, content")
      .in("conversation_id", ids);
    for (const id of ids) {
      const convMessages = (allContents ?? []).filter(
        (m) => m.conversation_id === id,
      );
      atRiskByConv.set(
        id,
        convMessages.some((m) => detectAtRisk(m.content)),
      );
    }
  }

  return rows.map((row) => {
    const last = lastByConv.get(row.id);
    const mentorLast = lastMentorByConv.get(row.id);
    const mentorNickname = mentorNicknames.get(row.id) ?? "mentore";

    return {
      id: row.id,
      mentor_id: row.mentor_id,
      mentor_nickname: mentorNickname,
      mentor_avatar_src: avatarDataUri(mentorNickname),
      status: row.status,
      closed_at: row.closed_at ?? null,
      last_message: last?.content ?? null,
      last_message_sender_nickname: last
        ? (senderNicknames.get(last.sender_id) ?? null)
        : null,
      last_message_at: last?.created_at ?? null,
      mentor_last_activity_at: mentorLast?.created_at ?? null,
      has_at_risk_content: atRiskByConv.get(row.id) ?? false,
    };
  });
}

export async function getUserActiveConversationListItem(
  supabase: SupabaseClient,
  userId: string,
): Promise<ConversationListItem | null> {
  const { data } = await supabase
    .from("conversations")
    .select("id, mentor_id, status, created_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return null;

  const enriched = await enrichConversations(supabase, [data as ConversationRow], {
    checkAtRisk: true,
  });
  return enriched[0] ?? null;
}

export async function getUserClosedConversations(
  supabase: SupabaseClient,
  userId: string,
): Promise<ConversationListItem[]> {
  const { data } = await supabase
    .from("conversations")
    .select("id, mentor_id, status, created_at, closed_at")
    .eq("user_id", userId)
    .eq("status", "closed")
    .order("created_at", { ascending: false });

  const rows = (data as ConversationRow[] | null) ?? [];
  rows.sort((a, b) => {
    const aTs = new Date(a.closed_at ?? a.created_at).getTime();
    const bTs = new Date(b.closed_at ?? b.created_at).getTime();
    return bTs - aTs;
  });

  return enrichConversations(supabase, rows);
}
