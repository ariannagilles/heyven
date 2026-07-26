export type ConversationListItem = {
  id: string;
  mentor_id: string;
  mentor_nickname: string;
  mentor_avatar_src: string;
  status: "active" | "closed";
  closed_at: string | null;
  last_message: string | null;
  last_message_sender_nickname: string | null;
  last_message_at: string | null;
  mentor_last_activity_at: string | null;
  has_at_risk_content: boolean;
};

export function mentorPresenceLabel(lastActivityIso: string | null): string {
  if (!lastActivityIso) return "Presto di nuovo qui";

  const hours =
    (Date.now() - new Date(lastActivityIso).getTime()) / (1000 * 60 * 60);

  if (hours <= 1) return "● Online ora";
  if (hours <= 72) return "Attivo di recente";
  if (hours <= 168) return "Attivo negli ultimi giorni";
  return "Presto di nuovo qui";
}
