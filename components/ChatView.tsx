"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/chat";
import { formatMessageTime } from "@/lib/time";
import { AvatarImage } from "./AvatarImage";

const MAX = 2000;

const ICEBREAKER_PROMPTS = [
  "In questi giorni mi sento…",
  "Vorrei parlare di…",
  "Ultimamente faccio fatica a…",
] as const;

type Props = {
  conversationId: string;
  meId: string;
  otherNickname: string;
  otherAvatarSrc: string;
  otherRoleLabel: string;
  initialMessages: Message[];
  initialClosed: boolean;
  iAmUser: boolean;
  fullScreen?: boolean;
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
  fullScreen = false,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [escalationDone, setEscalationDone] = useState(false);
  const [escalationError, setEscalationError] = useState<string | null>(null);
  const [changingMentor, setChangingMentor] = useState(false);
  const [showChangeConfirm, setShowChangeConfirm] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);
  const isInitialScrollRef = useRef(true);
  const wasDisconnectedRef = useRef(false);
  const [realtimeConnected, setRealtimeConnected] = useState(true);

  const showIcebreakers =
    !closed && iAmUser && messages.length === 0 && content.trim() === "";

  function applyIcebreakerPrompt(text: string) {
    setContent(text);
    textareaRef.current?.focus();
  }

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
    async function refetchMessages() {
      const { data } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, read, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    }

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
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          if (wasDisconnectedRef.current) {
            void refetchMessages();
            wasDisconnectedRef.current = false;
          }
          setRealtimeConnected(true);
        } else if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
          wasDisconnectedRef.current = true;
          setRealtimeConnected(false);
        }
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, conversationId]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 80;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  // Auto-scroll on new message when user is already at the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (isInitialScrollRef.current) {
      el.scrollTop = el.scrollHeight;
      isInitialScrollRef.current = false;
      return;
    }

    if (isAtBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]);

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

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [userMenuOpen]);

  async function handleChangeMentor() {
    setChangingMentor(true);
    setChangeError(null);
    const { error } = await supabase.rpc("change_mentor");
    if (error) {
      setChangingMentor(false);
      setChangeError(
        error.message.includes("no mentors")
          ? "Non ci sono altri Mentori disponibili in questo momento. Riprova più tardi."
          : "Non è stato possibile cambiare Mentore. Riprova.",
      );
      return;
    }
    router.push("/chat");
    router.refresh();
  }

  async function escalateToSupervision() {
    setEscalating(true);
    setEscalationError(null);
    const { error } = await supabase.rpc("mentor_escalate_conversation", {
      p_conversation_id: conversationId,
    });
    setEscalating(false);
    if (error) {
      setEscalationError(error.message);
      return;
    }
    setMenuOpen(false);
    setEscalationDone(true);
  }

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

  const useMentorChrome = fullScreen && iAmUser;
  const composerPlaceholder = iAmUser
    ? `Scrivi a ${otherNickname}…`
    : `Scrivi a @${otherNickname}…`;

  return (
    <div
      className={
        fullScreen
          ? "flex h-dvh flex-col"
          : "flex h-[calc(100dvh-3.5rem-1px)] flex-col"
      }
    >
      <div
        className={
          "sticky top-0 z-30 shrink-0 bg-petrolio/85 backdrop-blur-xl " +
          (fullScreen ? "pt-[env(safe-area-inset-top)]" : "")
        }
      >
        <header className="px-4 py-3">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              {fullScreen && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  aria-label="Torna indietro"
                  className="glass-card flex h-[34px] w-[34px] shrink-0 items-center justify-center text-lg leading-none text-cream/80 transition-transform active:scale-[0.98]"
                >
                  ‹
                </button>
              )}
              {useMentorChrome ? (
                <div
                  className="shrink-0 overflow-hidden border border-cream/15 p-0.5"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: "linear-gradient(145deg, #1D9E75 0%, #0B3F34 100%)",
                  }}
                >
                  <AvatarImage
                    src={otherAvatarSrc}
                    nickname={otherNickname}
                    size={36}
                    className="!rounded-[10px]"
                  />
                </div>
              ) : (
                <AvatarImage src={otherAvatarSrc} nickname={otherNickname} size={40} />
              )}
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold leading-tight text-cream">
                  @{otherNickname}
                </div>
                {useMentorChrome ? (
                  <p className="text-[11.5px] leading-snug text-mint">
                    ● Il tuo Mentore · supervisionato
                  </p>
                ) : (
                  <div className="text-xs leading-tight text-cream/60">
                    {otherRoleLabel}
                  </div>
                )}
              </div>
            </div>
            {!closed && iAmUser && (
              <div ref={userMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-label="Altre azioni"
                  aria-expanded={userMenuOpen}
                  className="glass-card inline-flex h-8 w-8 items-center justify-center text-cream/80"
                >
                  <span aria-hidden className="text-lg leading-none">
                    ⋯
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 min-w-[220px] rounded-2xl border border-cream/10 bg-petrolio-2/95 py-1 shadow-soft backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowChangeConfirm(true);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-cream hover:bg-cream/5"
                    >
                      Preferisco un altro Mentore
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowConfirm(true);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-cream hover:bg-cream/5"
                    >
                      Chiudi conversazione
                    </button>
                  </div>
                )}
              </div>
            )}
            {!closed && !iAmUser && (
              <div ref={menuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label="Altre azioni"
                  aria-expanded={menuOpen}
                  className="glass-card inline-flex h-8 w-8 items-center justify-center text-cream/80"
                >
                  <span aria-hidden className="text-lg leading-none">
                    ⋯
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 min-w-[220px] rounded-2xl border border-cream/10 bg-petrolio-2/95 py-1 shadow-soft backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => void escalateToSupervision()}
                      disabled={escalating || escalationDone}
                      className="block w-full px-4 py-2.5 text-left text-sm text-cream hover:bg-cream/5 disabled:opacity-50"
                    >
                      {escalating
                        ? "Invio segnalazione…"
                        : "Segnala alla supervisione"}
                    </button>
                  </div>
                )}
              </div>
            )}
            {closed && (
              <span className="shrink-0 rounded-full bg-cream/5 px-3 py-1.5 text-xs text-cream/60">
                chiusa
              </span>
            )}
          </div>
        </header>

        {!realtimeConnected && (
          <div className="px-4 pb-2">
            <p
              className="glass-card mx-auto max-w-2xl px-3 py-2 text-center text-[11.5px] text-[#EAC77A]"
              role="status"
            >
              Riconnessione in corso…
            </p>
          </div>
        )}

        {useMentorChrome && (
          <p className="mx-auto max-w-2xl px-4 pb-3 text-center text-[11.5px] leading-snug text-cream/50">
            {otherNickname} non è sempre online, e va bene così. Ti risponde entro
            domani sera.
          </p>
        )}
      </div>

      {(escalationDone || escalationError) && !iAmUser && (
        <div className="border-b border-cream/10 bg-cream/5 px-4 py-2">
          <div className="mx-auto max-w-2xl text-sm">
            {escalationDone && (
              <p className="text-cream/80">
                Segnalazione inviata. La supervisione è stata avvisata.
              </p>
            )}
            {escalationError && (
              <p className="msg-error">{escalationError}</p>
            )}
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div
          className={
            "mx-auto max-w-2xl space-y-3 px-4 py-4 " + (fullScreen ? "pb-28" : "")
          }
        >
          {messages.length === 0 ? (
            !iAmUser ? (
              <div className="glass-card p-5 text-center text-sm text-cream/70">
                Nessun messaggio, ancora.
              </div>
            ) : null
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === meId;
              return (
                <div
                  key={m.id}
                  className={"flex flex-col " + (mine ? "items-end" : "items-start")}
                >
                  <div
                    className={
                      "max-w-[80%] whitespace-pre-wrap px-4 py-2.5 text-[14px] leading-[1.5] text-cream " +
                      (mine
                        ? "rounded-[20px] rounded-br-[7px] border border-mint/25"
                        : "rounded-[20px] rounded-bl-[7px] border border-cream/12")
                    }
                    style={
                      mine
                        ? { backgroundColor: "rgba(93, 202, 165, 0.18)" }
                        : { backgroundColor: "rgba(245, 239, 227, 0.09)" }
                    }
                  >
                    {m.content}
                  </div>
                  <time
                    className="mt-1 px-1 text-[10.5px] text-cream/30 tabular-nums"
                    dateTime={m.created_at}
                  >
                    {formatMessageTime(m.created_at)}
                  </time>
                </div>
              );
            })
          )}
          {closed && (
            <div className="glass-card mt-2 p-4 text-center text-sm text-cream/70">
              Conversazione chiusa. I messaggi restano qui, ma non puoi più scrivere.
            </div>
          )}
        </div>
      </div>

      {!closed && (
        <form
          onSubmit={send}
          className={
            fullScreen
              ? "fixed bottom-0 left-0 right-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
              : "border-t border-cream/10 bg-petrolio/85 px-4 py-3 backdrop-blur-xl"
          }
        >
          {showIcebreakers && (
            <div className="mx-auto mb-3 max-w-2xl">
              <p className="mb-2 text-xs text-cream/50">Se non sai da dove iniziare:</p>
              <div className="flex flex-col gap-2">
                {ICEBREAKER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => applyIcebreakerPrompt(prompt)}
                    className="glass-card rounded-[18px] px-4 py-2.5 text-left text-sm text-cream/80 transition-transform active:scale-[0.98]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="glass-card mx-auto flex max-w-2xl items-end gap-2 rounded-[22px] p-2">
            <textarea
              ref={textareaRef}
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
              placeholder={composerPlaceholder}
              className="max-h-32 min-h-[40px] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[15px] text-cream outline-none placeholder:text-cream/30"
            />
            <button
              type="submit"
              disabled={sending || content.trim().length === 0}
              aria-label="Invia messaggio"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-[0.95] disabled:opacity-40"
              style={{
                background: "linear-gradient(180deg, #2CC79A 0%, #0F6E56 100%)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#04342C"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </button>
          </div>
          {error && (
            <p className="mx-auto mt-2 max-w-2xl msg-error">{error}</p>
          )}
        </form>
      )}

      {showChangeConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-cream/40 backdrop-blur-sm"
          onClick={() => !changingMentor && setShowChangeConfirm(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-mentor-title"
            onClick={(e) => e.stopPropagation()}
            className="glass-card rounded-3xl p-6 max-w-md w-full shadow-soft border border-cream/10"
          >
            <h3 id="change-mentor-title" className="text-lg font-semibold">
              Vuoi cambiare Mentore?
            </h3>
            <p className="text-sm text-cream/70 mt-2">
              Cambiare va bene, e puoi farlo quando vuoi. A volte però una
              relazione ha bisogno di un po&apos; di tempo per funzionare. Se te
              la senti, va benissimo così.
            </p>
            {changeError && (
              <p className="text-sm bg-[#D4EDE5] text-[#04342C] rounded-xl px-3 py-2 mt-3">
                {changeError}
              </p>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setShowChangeConfirm(false);
                  setChangeError(null);
                }}
                disabled={changingMentor}
                className="btn-outline"
              >
                Resto con @{otherNickname}
              </button>
              <button
                type="button"
                onClick={() => void handleChangeMentor()}
                disabled={changingMentor}
                className="btn-primary"
              >
                {changingMentor ? "Un momento…" : "Cambia Mentore"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-cream/40 backdrop-blur-sm"
          onClick={() => !closing && setShowConfirm(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-conv-title"
            onClick={(e) => e.stopPropagation()}
            className="glass-card rounded-3xl p-6 max-w-md w-full shadow-soft border border-cream/10"
          >
            <h3 id="close-conv-title" className="text-lg font-semibold">
              Chiudi conversazione
            </h3>
            <p className="text-sm text-cream/70 mt-2">
              Sei sicuro di voler chiudere questa conversazione? Non potrai più
              inviare messaggi.
            </p>
            {closeError && (
              <p className="msg-error mt-3">
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
