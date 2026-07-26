import Avatar from "@/components/Avatar";
import ReportButton from "@/components/ReportButton";

export type ContentReply = {
  id: string;
  content: string;
  nickname: string;
  reportTargetType: "reply" | "question_reply";
};

type Props = {
  replies: ContentReply[];
  emptyMessage?: string;
};

export default function ContentReplyList({ replies, emptyMessage }: Props) {
  if (replies.length === 0) {
    if (!emptyMessage) return null;
    return (
      <p className="mt-6 text-center text-sm text-cream/60">{emptyMessage}</p>
    );
  }

  return (
    <ul className="mt-6 space-y-[14px]">
      {replies.map((reply) => (
        <li key={reply.id} className="flex gap-3">
          <Avatar nickname={reply.nickname} size={30} className="rounded-lg shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="text-[12px] font-semibold text-cream">@{reply.nickname}</p>
              <ReportButton
                targetType={reply.reportTargetType}
                targetId={reply.id}
                className="ml-auto shrink-0"
              />
            </div>
            <p className="mt-0.5 whitespace-pre-wrap text-[13.5px] leading-[1.5] text-cream/90">
              {reply.content}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
