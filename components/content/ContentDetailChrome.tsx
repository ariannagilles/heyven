"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  replyForm?: ReactNode;
  reactionBar: ReactNode;
};

export default function ContentDetailChrome({ children, replyForm, reactionBar }: Props) {
  return (
    <>
      <div className="pb-52">{children}</div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto flex max-w-2xl flex-col gap-2">
          {replyForm}
          {reactionBar}
        </div>
      </div>
    </>
  );
}
