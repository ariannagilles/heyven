import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type ConversationStatus = "active" | "closed";

export type Conversation = {
  id: string;
  user_id: string;
  mentor_id: string;
  status: ConversationStatus;
  created_at: string;
};

export type MentorChatRow = {
  conversation_id: string;
  user_id: string;
  mentor_id: string;
  status: ConversationStatus;
  created_at: string;
  user_nickname: string;
  last_activity_at: string;
  last_message: string | null;
  unread_for_mentor: number;
};

export type Role = "user" | "mentor" | "admin";

export type Profile = {
  id: string;
  nickname: string;
  role: Role;
};

export const getProfile = cache(async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, nickname, role")
    .eq("id", userId)
    .maybeSingle();
  return (data as Profile | null) ?? null;
});

export async function getUserConversation(
  supabase: SupabaseClient,
  userId: string,
): Promise<Conversation | null> {
  const { data } = await supabase
    .from("conversations")
    .select("id, user_id, mentor_id, status, created_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  return (data as Conversation | null) ?? null;
}

export async function getConversationById(
  supabase: SupabaseClient,
  id: string,
): Promise<Conversation | null> {
  const { data } = await supabase
    .from("conversations")
    .select("id, user_id, mentor_id, status, created_at")
    .eq("id", id)
    .maybeSingle();
  return (data as Conversation | null) ?? null;
}

export async function getMessages(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<Message[]> {
  const { data } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, read, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data as Message[] | null) ?? [];
}

export async function getMentorChats(
  supabase: SupabaseClient,
): Promise<MentorChatRow[]> {
  const { data } = await supabase
    .from("mentor_chats")
    .select(
      "conversation_id, user_id, mentor_id, status, created_at, user_nickname, last_activity_at, last_message, unread_for_mentor",
    )
    .order("last_activity_at", { ascending: false });
  return (data as MentorChatRow[] | null) ?? [];
}

export type AssignedMentorProfile = {
  mentor_id: string;
  nickname: string;
  intro_text: string;
  completed_conversations: number;
  avg_rating: number;
  ratings_count: number;
};

export async function getAssignedMentorProfile(
  supabase: SupabaseClient,
): Promise<AssignedMentorProfile | null> {
  const { data } = await supabase.rpc("get_assigned_mentor_profile");
  const rows = (data as AssignedMentorProfile[] | null) ?? [];
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    avg_rating: Number(r.avg_rating),
    completed_conversations: Number(r.completed_conversations),
    ratings_count: Number(r.ratings_count),
  };
}

export type MentorRating = {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
};

export type MentorRatingsSummary = {
  avg: number;
  count: number;
  ratings: MentorRating[];
};

export async function getMentorRatingsSummary(
  supabase: SupabaseClient,
  mentorId: string,
): Promise<MentorRatingsSummary> {
  const { data } = await supabase
    .from("mentor_ratings")
    .select("id, rating, feedback, created_at")
    .eq("mentor_id", mentorId)
    .order("created_at", { ascending: false });

  const ratings = (data as MentorRating[] | null) ?? [];
  const count = ratings.length;
  const avg =
    count === 0
      ? 0
      : ratings.reduce((acc, r) => acc + r.rating, 0) / count;
  return { avg, count, ratings };
}

export const getUnreadCount = cache(async function getUnreadCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .eq("status", "active")
    .or(`user_id.eq.${userId},mentor_id.eq.${userId}`);

  const ids = (conversations ?? []).map((c) => c.id);
  if (ids.length === 0) return 0;

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", ids)
    .eq("read", false)
    .neq("sender_id", userId);
  return count ?? 0;
});

export type UserChatPreview = {
  conversationId: string;
  mentorNickname: string | null;
  lastMessage: string | null;
  lastActivityAt: string;
  unread: number;
};

export async function getUserChatPreview(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserChatPreview | null> {
  const conv = await getUserConversation(supabase, userId);
  if (!conv) return null;

  const [{ data: lastMsgRows }, mentorProfile, { count: unread }] = await Promise.all([
    supabase
      .from("messages")
      .select("content, created_at")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1),
    getProfile(supabase, conv.mentor_id),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conv.id)
      .eq("read", false)
      .neq("sender_id", userId),
  ]);

  const last = (lastMsgRows as { content: string; created_at: string }[] | null)?.[0];

  return {
    conversationId: conv.id,
    mentorNickname: mentorProfile?.nickname ?? null,
    lastMessage: last?.content ?? null,
    lastActivityAt: last?.created_at ?? conv.created_at,
    unread: unread ?? 0,
  };
}
