"use client";

import { useRouter } from "next/navigation";
import MentorConversationRatingSheet from "@/components/mentor/MentorConversationRatingSheet";
import { markAutoRatingPromptDismissed } from "@/lib/mentor-rating-prompt";

type Props = {
  conversationId: string;
  mentorNickname: string;
};

export default function RateConversationClient({
  conversationId,
  mentorNickname,
}: Props) {
  const router = useRouter();

  function leaveChat() {
    router.replace("/chat");
    router.refresh();
  }

  return (
    <MentorConversationRatingSheet
      open
      conversationId={conversationId}
      mentorNickname={mentorNickname}
      onStarsSubmitted={() => markAutoRatingPromptDismissed(conversationId)}
      onFinished={leaveChat}
      onSkipped={() => {
        markAutoRatingPromptDismissed(conversationId);
        leaveChat();
      }}
    />
  );
}
