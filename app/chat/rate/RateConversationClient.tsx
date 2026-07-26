"use client";

import { useRouter } from "next/navigation";
import MentorConversationRatingSheet from "@/components/mentor/MentorConversationRatingSheet";

type Props = {
  conversationId: string;
  mentorNickname: string;
};

export default function RateConversationClient({
  conversationId,
  mentorNickname,
}: Props) {
  const router = useRouter();

  return (
    <MentorConversationRatingSheet
      open
      conversationId={conversationId}
      mentorNickname={mentorNickname}
      onDone={() => {
        router.replace("/chat");
        router.refresh();
      }}
    />
  );
}
