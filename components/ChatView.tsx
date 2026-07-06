"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/chat";
import { AvatarImage } from "./AvatarImage";

const MAX = 2000;

type Props = {
  conversationId: string;
  meId: string;
  otherNickname: string;
  otherAvatarSrc: string;
  otherRoleLabel: string;
  initialMessages: Message[];
  initialClosed: boolean;
  iAmUser: boolean;
};

export default function ChatView({
  conversationId,
  meId,
  otherNickname,
  otherAvatarSrc,
  otherRoleLabel,
  initialMessages,
  initialClosed,
  iAmUser,
}: Props) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState(initialClosed);
  const [showConfirm, setShowConfirm] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function markIncomingAsRead() {
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .eq("read", false)
      .neq("sender_id", meId);
    if (!error) router.refresh();
  }

  // Mark as read whenever new messages from the other party arrive (also if closed).
  useEffect(() => {
    void markIncomingAsRead();
  }, [supabase, conversationId, meId, messages.length]);

  // Realtime: incoming messages on this conversation.
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) =>
            prev.some((x) => x.id === m.id) ? prev : [...prev, m],
          );
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, conversationId]);

  // Realtime: detect when the other side closes the conversation.
  useEffect(() => {
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          const status = (payload.new as { status?: string }).status;
          if (status === "closed") setClosed(true);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, conversationId]);

  // Auto-scroll on new message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX) {
      setError(`Massimo ${MAX} caratteri.`);
      return;
    }
    setSending(true);
    setContent("");
    const optimisticId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      conversation_id: conversationId,
      sender_id: meId,
      content: trimmed,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const { data, error: insErr } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: meId,
        content: trimmed,
      })
      .select("id, conversation_id, sender_id, content, read, created_at")
      .single();

    setSending(false);

    if (insErr || !data) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setError(insErr?.message ?? "Non è stato possibile inviare il messaggio.");
      return;
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === optimisticId ? (data as Message) : m)),
    );
    router.refresh();
  }

  async function confirmClose() {
    setCloseError(null);
    setClosing(true);
    await markIncomingAsRead();
    const { error } = await supabase.rpc("close_conversation", {
      p_conversation_id: conversationId,
    });
    setClosing(false);
    if (error) {
      setCloseError(error.message);
      return;
    }
    setShowConfirm(false);
    setClosed(true);
    if (iAmUser) {
      router.push(`/chat/rate?c=${conversationId}`);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-1px)]">
      <header className="px-4 py-3 border-b border-petrolio/10 bg-crema/80 backdrop-blur">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AvatarImage src={otherAvatarSrc} nickname={otherNickname} size={40} />
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight truncate">@{otherNickname}</div>
              <div className="text-xs text-petrolio/60 leading-tight">{otherRoleLabel}</div>
            </div>
          </div>
          {!closed && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="text-xs rounded-full px-3 py-1.5 bg-petrolio/5 text-petrolio hover:bg-petrolio/10 shrink-0"
            >
              Chiudi conversazione
            </button>
          )}
          {closed && (
            <span className="text-xs rounded-full px-3 py-1.5 bg-petrolio/5 text-petrolio/60 shrink-0">
              chiusa
            </span>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-2">
          {messages.length === 0 ? (
            <div className="card p-5 text-center text-sm text-petrolio/70">
              Nessun messaggio, ancora.
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === meId;
              return (
                <div
                  key={m.id}
                  className={"flex items-end gap-2 " + (mine ? "justify-end" : "justify-start")}
                >
                  {!mine && (
                    <AvatarImage
                      src={otherAvatarSrc}
                      nickname={otherNickname}
                      size={32}
                    />
                  )}
                  <div
                    className={
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap " +
                      (mine
                        ? "bg-petrolio text-crema rounded-br-md"
                        : "bg-white text-petrolio border border-petrolio/10 rounded-bl-md")
                    }
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
          {closed && (
            <div className="card p-4 text-center text-sm text-petrolio/70 mt-2">
              Conversazione chiusa. I messaggi restano qui, ma non puoi più scrivere.
            </div>
          )}
        </div>
      </div>

      {!closed && (
        <form
          onSubmit={send}
          className="border-t border-petrolio/10 bg-crema/90 backdrop-blur px-4 py-3"
        >
          <div className="mx-auto max-w-2xl flex items-end gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                }
              }}
              rows={1}
              maxLength={MAX}
              placeholder="Scrivi un messaggio…"
              className="field flex-1 min-h-[44px] max-h-32 py-2.5"
            />
            <button
              type="submit"
              disabled={sending || content.trim().length === 0}
              className="btn-primary"
            >
              invia
            </button>
          </div>
          {error && (
            <p className="mx-auto max-w-2xl mt-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </form>
      )}

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-petrolio/40 backdrop-blur-sm"
          onClick={() => !closing && setShowConfirm(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-conv-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-crema rounded-3xl p-6 max-w-md w-full shadow-soft border border-petrolio/10"
          >
            <h3 id="close-conv-title" className="text-lg font-semibold">
              Chiudi conversazione
            </h3>
            <p className="text-sm text-petrolio/70 mt-2">
              Sei sicuro di voler chiudere questa conversazione? Non potrai più
              inviare messaggi.
            </p>
            {closeError && (
              <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2 mt-3">
                {closeError}
              </p>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={closing}
                className="btn-outline"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={confirmClose}
                disabled={closing}
                className="btn-primary"
              >
                {closing ? "Chiusura…" : "Chiudi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
