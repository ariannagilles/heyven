"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { randomNickname } from "@/lib/nickname";
import { SPACES } from "@/lib/spaces";

type Phase = "splash" | "intro" | "step1" | "step2" | "step3";
type NicknameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const NICKNAME_TAKEN_HINT = "Questo nickname è già in uso, provane un altro";
const NICKNAME_RACE_ERROR =
  "Questo nickname è già stato preso da qualcun altro, provane uno diverso";

const EXTRA_SPACE = { slug: "non-lo-so", name: "Non lo so ancora", emoji: "❓" };

const DURATION_OPTIONS = [
  "Da poco",
  "Da alcuni mesi",
  "Da tanto tempo",
  "Non saprei dire",
] as const;

const INTRO_SLIDES = [
  {
    badgeText: "Senza maschera",
    badgeClass:
      "bg-gradient-to-b from-[#fbd48a] to-[#e8a93d] text-[#04342C] shadow-inner",
    description: "Anonimo, sicuro, senza giudizio.",
    Illustration: SlideOneIllustration,
  },
  {
    badgeText: "Il tuo spazio ti aspetta",
    badgeClass:
      "bg-gradient-to-b from-[#fbd48a] to-[#e8a93d] text-[#04342C] shadow-inner",
    description: "Ti portiamo dove ci sono persone che capiscono.",
    Illustration: SlideTwoIllustration,
  },
  {
    badgeText: "Una voce che conosce la strada",
    badgeClass:
      "bg-gradient-to-b from-[#fbd48a] to-[#e8a93d] text-[#04342C] shadow-inner",
    description: "Chi ti somiglia e chi ti ascolta, sempre.",
    Illustration: SlideThreeIllustration,
  },
] as const;

const INTRO_SLIDE_GAP = 12;

const introTitles = [
  "Heyven è rifugio",
  "Qualcuno qui sa di cosa parli",
  "C'è chi ti somiglia, e c'è chi ti ascolta",
];

const PREVIEW_POSTS = [
  {
    nickname: "luna_quiet",
    space: "Ansia",
    emoji: "🌀",
    content:
      "Oggi il petto si è stretto in ufficio senza un motivo chiaro. Ho scritto qui perché almeno qualcuno capisce cosa intendo.",
    meToo: 12,
    replies: 4,
    avatarBg: "#D4EDE5",
  },
  {
    nickname: "vento_lento",
    space: "Solitudine",
    emoji: "🌙",
    content:
      "Non è che non ho persone intorno. È che a volte mi sento invisibile anche quando rispondono ai miei messaggi.",
    meToo: 8,
    replies: 6,
    avatarBg: "#e8f5f0",
  },
] as const;

function isValidNickname(nick: string): boolean {
  return (
    nick.length >= 2 &&
    nick.length <= 24 &&
    /^[a-zA-Z0-9._-]+$/.test(nick)
  );
}

function isDatabaseNicknameError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("duplicate key") ||
    m.includes("unique constraint") ||
    m.includes("profiles_nickname") ||
    m.includes("database error saving new user") ||
    (m.includes("nickname") &&
      (m.includes("duplicate") || m.includes("unique") || m.includes("already")))
  );
}

function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mt-6 flex gap-1.5">
      {[1, 2, 3].map((segment) => (
        <div
          key={segment}
          className={`h-[3px] flex-1 rounded-full ${
            segment <= step ? "bg-[#FAC775]" : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

function SlideOneIllustration() {
  return (
    <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
      <rect x="72" y="36" width="176" height="148" rx="10" fill="#FAEEDA" fillOpacity="0.35" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="2" />
      <rect x="88" y="52" width="144" height="96" rx="6" fill="#FFF8EC" />
      <path
        d="M88 148 L232 148 L232 220 L88 220 Z"
        fill="#E8DFC8"
      />
      <line x1="96" y1="60" x2="96" y2="140" stroke="#D4EDE5" strokeWidth="3" />
      <line x1="120" y1="60" x2="120" y2="140" stroke="#D4EDE5" strokeWidth="3" />
      <line x1="144" y1="60" x2="144" y2="140" stroke="#D4EDE5" strokeWidth="3" />
      <line x1="168" y1="60" x2="168" y2="140" stroke="#D4EDE5" strokeWidth="3" />
      <line x1="192" y1="60" x2="192" y2="140" stroke="#D4EDE5" strokeWidth="3" />
      <line x1="216" y1="60" x2="216" y2="140" stroke="#D4EDE5" strokeWidth="3" />
      <circle cx="40" cy="48" r="2" fill="#9BB5AB" />
      <circle cx="52" cy="72" r="2" fill="#9BB5AB" />
      <circle cx="36" cy="96" r="2" fill="#9BB5AB" />
      <circle cx="56" cy="120" r="2" fill="#9BB5AB" />
      <circle cx="44" cy="144" r="2" fill="#9BB5AB" />
      <circle cx="280" cy="56" r="2" fill="#9BB5AB" />
      <circle cx="268" cy="88" r="2" fill="#9BB5AB" />
      <circle cx="284" cy="116" r="2" fill="#9BB5AB" />
      <ellipse cx="160" cy="118" rx="34" ry="20" fill="#FAC775" opacity="0.55" />
      <rect x="148" y="152" width="24" height="18" rx="4" fill="#8FB5A4" />
      <ellipse cx="160" cy="148" rx="18" ry="10" fill="#6FA08E" />
    </svg>
  );
}

function SlideTwoIllustration() {
  return (
    <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
      <path
        d="M40 170 C 80 120, 100 90, 160 110"
        fill="none"
        stroke="#FAEEDA"
        strokeOpacity="0.9"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M280 170 C 240 130, 210 80, 160 110"
        fill="none"
        stroke="#FAEEDA"
        strokeOpacity="0.9"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M160 40 C 150 80, 155 95, 160 110"
        fill="none"
        stroke="#FAEEDA"
        strokeOpacity="0.9"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="72" cy="132" r="4" fill="#FAEEDA" />
      <circle cx="108" cy="98" r="4" fill="#FAEEDA" />
      <circle cx="248" cy="126" r="4" fill="#FAEEDA" />
      <circle cx="212" cy="88" r="4" fill="#FAEEDA" />
      <circle cx="160" cy="58" r="4" fill="#FAEEDA" />
      <circle cx="160" cy="110" r="22" fill="#FAC775" />
      <circle cx="160" cy="110" r="14" fill="#F5D48A" opacity="0.8" />
    </svg>
  );
}

function SlideThreeIllustration() {
  return (
    <svg viewBox="0 0 320 220" className="h-full w-full" aria-hidden>
      <rect x="36" y="56" width="168" height="72" rx="18" fill="white" fillOpacity="0.2" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="2" />
      <circle cx="64" cy="92" r="16" fill="#D4EDE5" />
      <text x="64" y="97" textAnchor="middle" fontSize="14">
        🙂
      </text>
      <rect x="92" y="78" width="92" height="10" rx="5" fill="#E8F5F0" />
      <rect x="92" y="96" width="72" height="10" rx="5" fill="#E8F5F0" />
      <rect x="116" y="148" width="168" height="72" rx="18" fill="#04342C" />
      <circle cx="252" cy="184" r="16" fill="#0F6E56" />
      <text x="252" y="189" textAnchor="middle" fill="#FAEEDA" fontSize="14" fontWeight="600">
        M
      </text>
      <rect x="136" y="170" width="92" height="10" rx="5" fill="#0F6E56" />
      <rect x="136" y="188" width="72" height="10" rx="5" fill="#0F6E56" />
    </svg>
  );
}

function IntroPhase({
  slideIndex,
  nickname,
  onSlideChange,
  onStart,
  onSkip,
}: {
  slideIndex: number;
  nickname: string;
  onSlideChange: (index: number) => void;
  onStart: () => void;
  onSkip: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateWidth = () => setViewportWidth(el.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const slideWidth = Math.max(viewportWidth - 48, 0);
  const slideStride = slideWidth + INTRO_SLIDE_GAP;
  const trackOffset = slideIndex * slideStride - dragOffset;

  const goNext = useCallback(() => {
    if (slideIndex < INTRO_SLIDES.length - 1) {
      onSlideChange(slideIndex + 1);
    } else {
      onStart();
    }
  }, [onSlideChange, onStart, slideIndex]);

  const finishDrag = useCallback(
    (deltaX: number) => {
      const threshold = 50;
      if (deltaX >= threshold && slideIndex < INTRO_SLIDES.length - 1) {
        onSlideChange(slideIndex + 1);
      } else if (deltaX <= -threshold && slideIndex > 0) {
        onSlideChange(slideIndex - 1);
      }
      setDragOffset(0);
    },
    [onSlideChange, slideIndex],
  );

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = true;
    dragStartX.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current || dragStartX.current == null) return;
    setDragOffset(dragStartX.current - e.clientX);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current || dragStartX.current == null) return;
    const deltaX = dragStartX.current - e.clientX;
    dragging.current = false;
    dragStartX.current = null;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    finishDrag(deltaX);
  }

  function onPointerCancel(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const deltaX =
      dragStartX.current != null ? dragStartX.current - e.clientX : 0;
    dragging.current = false;
    dragStartX.current = null;
    setIsDragging(false);
    finishDrag(deltaX);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-gradient-to-b from-[#0d2b24] via-[#04342C] to-[#021a16] pb-10">
      <h1 className="px-8 pb-6 pt-14 text-2xl font-bold leading-tight text-white transition-all duration-300">
        {introTitles[slideIndex]}
      </h1>

      <div className="flex-1">
        <div
          ref={viewportRef}
          className="overflow-visible px-4 touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <div
            className={`flex ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
            style={{
              gap: INTRO_SLIDE_GAP,
              transform: `translateX(-${trackOffset}px)`,
            }}
          >
            {INTRO_SLIDES.map((slide, index) => (
              <article
                key={slide.badgeText}
                className="shrink-0 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl"
                style={{ width: slideWidth > 0 ? slideWidth : "calc(100% - 48px)" }}
                aria-hidden={index !== slideIndex}
              >
                <div className="mb-5 h-48 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <slide.Illustration />
                </div>

                <div
                  className={`mb-3 w-full rounded-2xl px-5 py-2.5 text-center text-sm font-semibold ${slide.badgeClass}`}
                  aria-hidden
                >
                  {slide.badgeText}
                </div>

                <p className="text-center text-sm leading-relaxed text-white/60">
                  {slide.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-white/40">
          Step {slideIndex + 1} di 3
        </p>
      </div>

      <div className="mt-6 px-4">
        <button
          type="button"
          onClick={goNext}
          className="w-full rounded-2xl border border-white/25 bg-white/15 py-4 font-semibold text-white backdrop-blur-xl transition active:scale-[0.99]"
        >
          {slideIndex < INTRO_SLIDES.length - 1 ? "Prossimo" : "Inizia"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 w-full text-center text-sm text-white/30 underline-offset-2 hover:underline"
        >
          Salta l&apos;introduzione
        </button>
      </div>
    </main>
  );
}

function StepShell({
  progress,
  children,
}: {
  progress: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-gradient-to-b from-[#0a2e26] via-[#04342C] to-[#021a16] px-6 pb-10">
      <div className="mx-auto w-full max-w-md">
        <p className="pt-12 text-lg font-semibold text-[#FAC775]">heyven</p>
        <ProgressBar step={progress} />
        {children}
      </div>
    </main>
  );
}

function GlassInput({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-white/60">{label}</span>
      {children}
      {hint && <p className="mt-1.5 text-xs text-white/40">{hint}</p>}
    </label>
  );
}

const inputClassName =
  "mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/50";

export default function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [phase, setPhase] = useState<Phase>("splash");
  const [introSlide, setIntroSlide] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  useEffect(() => {
    if (phase === "splash") {
      const t = setTimeout(() => setPhase("intro"), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    const nick = nickname.trim();

    if (!nick) {
      setNicknameStatus("idle");
      return;
    }

    if (!isValidNickname(nick)) {
      setNicknameStatus("invalid");
      return;
    }

    setNicknameStatus("checking");
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("nickname_available", {
        p_nickname: nick,
      });

      if (rpcError) {
        setNicknameStatus("idle");
        return;
      }

      setNicknameStatus(data === true ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname]);

  const submitDisabled =
    loading ||
    nicknameStatus === "checking" ||
    nicknameStatus === "taken" ||
    nicknameStatus === "invalid";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const nick = nickname.trim();
    if (!isValidNickname(nick)) {
      setError("Il nickname deve avere tra 2 e 24 caratteri e usare solo lettere, numeri, . _ -");
      return;
    }
    if (nicknameStatus === "taken") {
      setError(NICKNAME_TAKEN_HINT);
      return;
    }
    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname: nick } },
    });
    setLoading(false);

    if (signUpError) {
      if (isDatabaseNicknameError(signUpError.message)) {
        setError(NICKNAME_RACE_ERROR);
        setNicknameStatus("taken");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (data.session) {
      setPhase("step2");
    } else {
      setInfo("Ti abbiamo inviato una mail di conferma. Apri il link, poi torna qui e fai login.");
    }
  }

  async function onContinueStep2() {
    if (!selectedSpace || !selectedDuration) return;

    setStep2Loading(true);
    setStep2Error(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStep2Loading(false);
      setStep2Error("Sessione non trovata. Conferma l'email e accedi di nuovo.");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ preferred_space: selectedSpace })
      .eq("id", user.id);

    setStep2Loading(false);

    if (updateError) {
      setStep2Error(updateError.message);
      return;
    }

    setPhase("step3");
  }

  async function onEnterHeyven() {
    let destination = next;
    if (selectedSpace && selectedSpace !== "non-lo-so") {
      destination = `/spazi/${selectedSpace}`;
    }
    router.replace(destination);
    router.refresh();
  }

  if (phase === "splash") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#04342C]">
        <img
          src="/logo-white.png"
          alt="heyven"
          width={180}
          height={80}
          style={{ objectFit: "contain" }}
        />
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <IntroPhase
        slideIndex={introSlide}
        nickname={nickname.trim()}
        onSlideChange={setIntroSlide}
        onStart={() => setPhase("step1")}
        onSkip={() => setPhase("step1")}
      />
    );
  }

  if (phase === "step1") {
    return (
      <StepShell progress={1}>
        <h1 className="mt-6 text-2xl font-semibold text-white">Crea il tuo rifugio</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Il nickname è l&apos;unico nome visibile. Nessuno saprà chi sei davvero.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-xl"
        >
          <div className="space-y-4">
            <GlassInput
              label="Indirizzo email"
              hint="Usata solo per recuperare l'accesso. Non sarà mai visibile ad altri."
            >
              <input
                type="email"
                className={inputClassName}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </GlassInput>

            <GlassInput label="Nickname anonimo">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setNickname(randomNickname());
                    setError(null);
                  }}
                  className="text-xs font-medium text-white/60 underline underline-offset-2"
                >
                  ✦ Genera per me
                </button>
              </div>
              <input
                className={inputClassName}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="es. luna_silente"
                autoComplete="off"
                required
              />
              {nicknameStatus === "taken" && (
                <p className="mt-1.5 text-xs text-white/40">{NICKNAME_TAKEN_HINT}</p>
              )}
              {nicknameStatus === "checking" &&
                nickname.trim().length > 0 &&
                isValidNickname(nickname.trim()) && (
                  <p className="mt-1.5 text-xs text-white/40">Verifica disponibilità…</p>
                )}
            </GlassInput>

            <GlassInput label="Password">
              <input
                type="password"
                className={inputClassName}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </GlassInput>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/80">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/80">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={submitDisabled}
            className="mt-4 w-full rounded-2xl bg-[#FAC775] py-4 font-semibold text-[#04342C] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creazione…" : "Crea il mio spazio"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-white/60">
          Hai già un account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline text-white/80">
            Accedi
          </Link>
        </p>
      </StepShell>
    );
  }

  if (phase === "step2") {
    const spaceOptions = [...SPACES.map((s) => ({ slug: s.slug, name: s.name, emoji: s.emoji })), EXTRA_SPACE];
    const canContinue = Boolean(selectedSpace && selectedDuration) && !step2Loading;

    return (
      <StepShell progress={2}>
        <h1 className="mt-6 text-2xl font-semibold text-white">Trova il tuo spazio</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Non serve avere le parole giuste. Scegli quello che ti sembra più vicino.
        </p>

        <div className="mt-6 space-y-6">
          <section>
            <h2 className="text-sm font-medium text-white/60">
              Cosa ti pesa di più in questo periodo?
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {spaceOptions.map((space) => {
                const active = selectedSpace === space.slug;
                return (
                  <button
                    key={space.slug}
                    type="button"
                    onClick={() => setSelectedSpace(space.slug)}
                    className={
                      active
                        ? "rounded-full bg-white px-4 py-2 text-sm font-medium text-[#04342C]"
                        : "rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/60"
                    }
                  >
                    {space.emoji} {space.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-white/60">
              Da quanto tempo ci convivi?
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((option) => {
                const active = selectedDuration === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedDuration(option)}
                    className={
                      active
                        ? "rounded-full bg-white px-4 py-2 text-sm font-medium text-[#04342C]"
                        : "rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/60"
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {step2Error && (
          <p className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/80">
            {step2Error}
          </p>
        )}

        <button
          type="button"
          onClick={onContinueStep2}
          disabled={!canContinue}
          className="mt-6 w-full rounded-2xl bg-[#FAC775] py-4 font-semibold text-[#04342C] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {step2Loading ? "Salvataggio…" : "Continua →"}
        </button>
      </StepShell>
    );
  }

  return (
    <StepShell progress={3}>
      <h1 className="mt-6 text-2xl font-semibold text-white">Scopri chi c&apos;è</h1>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Qualcuno ha già scritto quello che forse stavi cercando le parole per dire.
      </p>

      <div className="mt-6 space-y-3">
        {PREVIEW_POSTS.map((post) => (
          <article
            key={post.nickname}
            className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-xl"
          >
            <header className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-[#04342C]"
                style={{ backgroundColor: post.avatarBg }}
              >
                {post.nickname.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">@{post.nickname}</p>
                <p className="text-xs text-white/60">
                  {post.emoji} {post.space}
                </p>
              </div>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{post.content}</p>
            <p className="mt-3 text-xs text-white/40">
              💚 Anch&apos;io · {post.meToo} · 💬 {post.replies} risposte
            </p>
          </article>
        ))}

        <article className="mt-2 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAC775]/30 text-sm font-semibold text-[#FAC775]">
              S
            </div>
            <div>
              <p className="font-medium text-white">Sara · Mentore</p>
              <p className="text-xs text-white/60">
                Ha attraversato l&apos;ansia, qui da 8 mesi
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm italic leading-relaxed text-white/80">
            &ldquo;Sono qui perché qualcuno c&apos;è stato per me quando ne avevo bisogno. Adesso
            voglio fare lo stesso.&rdquo;
          </p>
        </article>
      </div>

      <button
        type="button"
        onClick={onEnterHeyven}
        className="mt-4 w-full rounded-2xl bg-[#FAC775] py-4 font-semibold text-[#04342C] transition active:scale-[0.99]"
      >
        Entra in Heyven ✦
      </button>
    </StepShell>
  );
}
