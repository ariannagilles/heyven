"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  open: boolean;
  onClose: () => void;
  conversationId: string;
};

export default function CloseConversationSheet({
  open,
  onClose,
  conversationId,
}: Props) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function confirmClose() {
    setClosing(true);
    setError(null);
    const supabase = createClient();
    const { error: closeError } = await supabase.rpc("close_conversation", {
      p_conversation_id: conversationId,
    });
    setClosing(false);

    if (closeError) {
      setError(closeError.message);
      return;
    }

    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-petrolio/40 p-4 backdrop-blur-sm"
      onClick={() => !closing && onClose()}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-conversation-title"
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-md rounded-t-[28px] rounded-b-[24px] p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <h2
          id="close-conversation-title"
          className="font-display text-[20px] leading-snug text-cream"
        >
          Chiudere questa conversazione?
        </h2>
        <p className="mt-3 text-[14px] leading-[1.55] text-cream/70">
          La sposta tra le tue chat passate, dove resta tua da rileggere quando
          vuoi. Da lì potrai iniziare con un nuovo Mentore.
        </p>
        {error && <p className="msg-error mt-3">{error}</p>}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => void confirmClose()}
            disabled={closing}
            className="w-full rounded-full bg-cream py-3.5 text-[15px] font-semibold text-petrolio transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {closing ? "Chiusura…" : "Sì, chiudo"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={closing}
            className="w-full py-2 text-[15px] text-cream/55 transition-colors hover:text-cream/75 disabled:opacity-50"
          >
            Resto qui
          </button>
        </div>
      </div>
    </div>
  );
}
