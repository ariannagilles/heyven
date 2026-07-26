"use client";

import Link from "next/link";
import { useState } from "react";
import {
  mentorPresenceLabel,
  type ConversationListItem,
} from "@/lib/mentor-list-types";
import { AvatarImage } from "@/components/AvatarImage";
import CloseConversationSheet from "./CloseConversationSheet";

function MentorAvatar({
  src,
  nickname,
  size,
  muted = false,
}: {
  src: string;
  nickname: string;
  size: number;
  muted?: boolean;
}) {
  const outerRadius = Math.round(size * (26 / 76));

  return (
    <div
      className={
        "shrink-0 overflow-hidden border border-cream/15 p-0.5 " +
        (muted ? "opacity-70 saturate-[0.65]" : "")
      }
      style={{
        width: size,
        height: size,
        borderRadius: outerRadius,
        background: "linear-gradient(145deg, #1D9E75 0%, #0B3F34 100%)",
      }}
    >
      <AvatarImage
        src={src}
        nickname={nickname}
        size={size - 4}
        className="!rounded-[10px]"
      />
    </div>
  );
}

function ActiveConversationCard({
  item,
  userNickname,
}: {
  item: ConversationListItem;
  userNickname: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const presence = mentorPresenceLabel(item.mentor_last_activity_at);
  const previewAuthor =
    item.last_message_sender_nickname === userNickname
      ? "Tu"
      : item.last_message_sender_nickname
        ? `@${item.last_message_sender_nickname}`
        : null;

  return (
    <>
      <article className="glass-card relative p-4">
        <div className="flex items-start gap-3">
          <Link href="/chat/incontro" className="shrink-0">
            <MentorAvatar
              src={item.mentor_avatar_src}
              nickname={item.mentor_nickname}
              size={48}
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href="/chat/incontro" className="block">
              <p className="text-[15px] font-semibold leading-tight text-cream">
                @{item.mentor_nickname}
              </p>
              <p className="mt-0.5 text-[12px] text-mint">● attivo</p>
              <p className="mt-1 text-[12px] text-cream/55">{presence}</p>
            </Link>
          </div>
          <div className="relative shrink-0">
            <button
              type="button"
              aria-label="Altre azioni"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="glass-card flex h-8 w-8 items-center justify-center text-cream/80"
            >
              <span aria-hidden className="text-lg leading-none">
                ⋯
              </span>
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Chiudi menu"
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-2xl border border-cream/10 bg-petrolio-2/95 py-1 shadow-soft backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setSheetOpen(true);
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-cream hover:bg-cream/5"
                  >
                    Chiudi conversazione
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {item.last_message && (
          <>
            <div className="my-3 border-t border-cream/10" />
            <p className="text-[13px] leading-[1.5] text-cream/55">
              {previewAuthor && (
                <span className="font-medium text-mint">{previewAuthor}: </span>
              )}
              {item.last_message}
            </p>
          </>
        )}

        <Link
          href={`/chat/c/${item.id}`}
          className="mt-4 block rounded-full bg-cream py-2.5 text-center text-sm font-semibold text-petrolio transition-transform active:scale-[0.98]"
        >
          Apri la conversazione ›
        </Link>
        <Link
          href="/chat/incontro"
          className="mt-2 block text-center text-[12px] text-cream/50 underline underline-offset-2 hover:text-cream/70"
        >
          Profilo del Mentore
        </Link>
      </article>

      <CloseConversationSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        conversationId={item.id}
      />
    </>
  );
}

function PastConversationRow({ item }: { item: ConversationListItem }) {
  const closedDate = item.closed_at ?? item.last_message_at ?? null;
  const dateLabel = closedDate
    ? new Date(closedDate).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Link
      href={`/chat/c/${item.id}`}
      className="flex items-center gap-3 rounded-[18px] px-3 py-3 transition active:scale-[0.99]"
      style={{ backgroundColor: "rgba(245, 239, 227, 0.05)" }}
    >
      <MentorAvatar
        src={item.mentor_avatar_src}
        nickname={item.mentor_nickname}
        size={36}
        muted
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-cream/75">
          @{item.mentor_nickname}
        </p>
        <p className="mt-0.5 text-[11px] text-cream/40">
          Conversazione chiusa · {dateLabel}
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-cream/15 px-2.5 py-1 text-[10px] text-cream/45">
        sola lettura
      </span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cream/55">
      {children}
    </p>
  );
}

type Props = {
  active: ConversationListItem | null;
  past: ConversationListItem[];
  userNickname: string;
};

export default function MentorListScreen({ active, past, userNickname }: Props) {
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-24 pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <h1 className="font-display text-[24px] leading-tight text-cream">
        Il tuo Mentore
      </h1>

      <section className="mt-6">
        <SectionLabel>Conversazione attiva</SectionLabel>
        <div className="mt-3">
          {active ? (
            <ActiveConversationCard item={active} userNickname={userNickname} />
          ) : (
            <article className="glass-card space-y-4 p-5 text-center">
              <p className="text-[14px] leading-[1.55] text-cream/75">
                Quando ti senti pronto, puoi attivare un Mentore: una persona
                reale, pronta ad ascoltarti senza giudicare.
              </p>
              <Link
                href="/chat/incontro"
                className="block rounded-full bg-cream py-3.5 text-[15px] font-semibold text-petrolio transition-transform active:scale-[0.98]"
              >
                Attiva il tuo Mentore
              </Link>
            </article>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="mt-8">
          <SectionLabel>Chat passate</SectionLabel>
          <ul className="mt-3 space-y-2">
            {past.map((item) => (
              <li key={item.id}>
                <PastConversationRow item={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
