export type ReportTargetType =
  | "post"
  | "reply"
  | "question"
  | "question_reply"
  | "story"
  | "message"
  | "conversation";

export const TARGET_TYPE_LABELS: Record<ReportTargetType, string> = {
  post: "Post (sfogo)",
  reply: "Risposta",
  question: "Domanda",
  question_reply: "Risposta a domanda",
  story: "Storia",
  message: "Messaggio chat",
  conversation: "Conversazione mentore",
};
