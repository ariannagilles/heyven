import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportTargetType } from "./report-types";

export type { ReportTargetType } from "./report-types";
export { TARGET_TYPE_LABELS } from "./report-types";

export type PendingReport = {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string | null;
  created_at: string;
};

export type EnrichedReport = PendingReport & {
  contentUrl: string | null;
};

function idsForType(reports: PendingReport[], type: ReportTargetType): string[] {
  return reports.filter((r) => r.target_type === type).map((r) => r.target_id);
}

export async function enrichPendingReports(
  supabase: SupabaseClient,
  reports: PendingReport[],
): Promise<EnrichedReport[]> {
  if (reports.length === 0) return [];

  const urlByTarget = new Map<string, string>();

  for (const r of reports.filter((x) => x.target_type === "post")) {
    urlByTarget.set(`post:${r.target_id}`, `/post/${r.target_id}`);
  }

  const replyIds = idsForType(reports, "reply");
  if (replyIds.length > 0) {
    const { data } = await supabase
      .from("replies")
      .select("id, post_id")
      .in("id", replyIds);
    for (const row of data ?? []) {
      urlByTarget.set(`reply:${row.id}`, `/post/${row.post_id}`);
    }
  }

  const questionIds = idsForType(reports, "question");
  if (questionIds.length > 0) {
    const { data } = await supabase
      .from("questions")
      .select("id, space_slug")
      .in("id", questionIds);
    for (const row of data ?? []) {
      urlByTarget.set(
        `question:${row.id}`,
        `/spazi/${row.space_slug}/domande/${row.id}`,
      );
    }
  }

  const questionReplyIds = idsForType(reports, "question_reply");
  if (questionReplyIds.length > 0) {
    const { data: replies } = await supabase
      .from("question_replies")
      .select("id, question_id")
      .in("id", questionReplyIds);
    const parentIds = [...new Set((replies ?? []).map((r) => r.question_id))];
    const { data: questions } =
      parentIds.length > 0
        ? await supabase
            .from("questions")
            .select("id, space_slug")
            .in("id", parentIds)
        : { data: [] };
    const slugByQuestion = new Map(
      (questions ?? []).map((q) => [q.id, q.space_slug as string]),
    );
    for (const row of replies ?? []) {
      const slug = slugByQuestion.get(row.question_id);
      if (slug) {
        urlByTarget.set(
          `question_reply:${row.id}`,
          `/spazi/${slug}/domande/${row.question_id}`,
        );
      }
    }
  }

  const storyIds = idsForType(reports, "story");
  if (storyIds.length > 0) {
    const { data } = await supabase
      .from("stories")
      .select("id, space_slug")
      .in("id", storyIds);
    for (const row of data ?? []) {
      urlByTarget.set(`story:${row.id}`, `/spazi/${row.space_slug}/storie`);
    }
  }

  const messageIds = idsForType(reports, "message");
  if (messageIds.length > 0) {
    const { data } = await supabase
      .from("messages")
      .select("id, conversation_id")
      .in("id", messageIds);
    for (const row of data ?? []) {
      urlByTarget.set(`message:${row.id}`, `/chat/c/${row.conversation_id}`);
    }
  }

  const conversationIds = idsForType(reports, "conversation");
  for (const id of conversationIds) {
    urlByTarget.set(`conversation:${id}`, `/mentor/c/${id}`);
  }

  return reports.map((r) => ({
    ...r,
    contentUrl: urlByTarget.get(`${r.target_type}:${r.target_id}`) ?? null,
  }));
}
