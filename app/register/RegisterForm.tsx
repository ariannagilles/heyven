"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { randomNickname } from "@/lib/nickname";
import { SPACES } from "@/lib/spaces";
import PasswordInput from "@/components/PasswordInput";

type Phase = "intro" | "step1" | "step1b" | "step2" | "step3";
type NicknameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const NICKNAME_TAKEN_HINT = "Questo nickname è già in uso, provane un altro";
const NICKNAME_RACE_ERROR =
  "Questo nickname è già stato preso da qualcun altro, provane uno diverso";

const FEELING_LABELS: Record<string, string> = {
  ansia: "Con il petto stretto, in allerta",
  depressione: "Spento, senza energia",
  dca: "In conflitto con cibo e corpo",
  burnout: "Esausto, svuotato",
  relazioni: "Ferito da qualcuno",
  solitudine: "Solo, anche in mezzo agli altri",
  lutto: "In lutto per una perdita",
  identita: "Confuso su chi sono",
};

const EXTRA_FEELING_OPTIONS = [
  {
    slug: "vuole-aiutare",
    label: "Sto bene, ma vorrei essere d'aiuto a qualcuno",
    emoji: "💚",
  },
  {
    slug: "non-lo-so",
    label: "Non saprei descriverlo",
    emoji: "❓",
  },
] as const;

const DURATION_OPTIONS = [
  "Da poco",
  "Da alcuni mesi",
  "Da tanto tempo",
  "Non saprei dire",
] as const;

const INTRO_SLIDES = [
  {
    description:
      "Uno spazio anonimo, tutto tuo, per le cose che non riesci a dire ad alta voce.",
    Illustration: SlideOneIllustration,
  },
  {
    description:
      "Otto spazi tematici. Ognuno è un posto dove non devi spiegarti da zero.",
    Illustration: SlideTwoIllustration,
  },
  {
    description: "Una community che capisce e un Mentore che accompagna.",
    Illustration: SlideThreeIllustration,
  },
] as const;

const INTRO_SLIDE_GAP = 12;

const ONBOARDING_TITLE = "font-display text-[25px] leading-tight text-cream";
const ONBOARDING_SUBTITLE = "text-sm leading-relaxed text-cream/70";
const ONBOARDING_PRIMARY_BTN =
  "w-full rounded-full bg-cream py-4 text-[15px] font-semibold text-petrolio transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";
const ONBOARDING_SECONDARY_TEXT = "text-center text-sm text-cream/55";
const ONBOARDING_SECONDARY_LINK =
  "font-semibold text-cream/70 underline underline-offset-2 hover:text-cream/85";
const ONBOARDING_ERROR =
  "rounded-xl bg-[#D4EDE5] px-3 py-2 text-sm text-[#04342C]";
const ONBOARDING_INFO =
  "rounded-2xl border border-cream/10 bg-cream/5 px-3 py-2 text-sm text-cream/80";

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

function isAtLeast18(dateStr: string): boolean {
  if (!dateStr) return false;
  const birth = new Date(dateStr);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  return hasHadBirthdayThisYear ? age >= 18 : age - 1 >= 18;
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

function ProgressBar({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mt-6 flex gap-1.5">
      {[1, 2, 3, 4].map((segment) => (
        <div
          key={segment}
          className={`h-[3px] flex-1 rounded-full ${
            segment <= step ? "bg-mint" : "bg-cream/[0.16]"
          }`}
        />
      ))}
    </div>
  );
}

function SlideOneIllustration() {
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full" aria-hidden>
      <ellipse cx="160" cy="52" rx="48" ry="28" fill="#FAC775" opacity="0.45" />
      <ellipse cx="160" cy="48" rx="32" ry="18" fill="#FAC775" opacity="0.65" />
      <path
        d="M72 188 C72 132, 108 96, 160 96 C212 96, 248 132, 248 188 Z"
        fill="#0F6E56"
        opacity="0.18"
      />
      <path
        d="M88 188 L88 118 Q88 88, 118 78 L202 78 Q232 88, 232 118 L232 188 Z"
        fill="#04342C"
        opacity="0.12"
        stroke="#04342C"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M96 188 L96 124 Q96 98, 124 92 L196 92 Q224 98, 224 124 L224 188 Z"
        fill="#FAEEDA"
        stroke="#04342C"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <ellipse cx="160" cy="158" rx="22" ry="14" fill="#0F6E56" opacity="0.55" />
      <path
        d="M148 172 Q160 182, 172 172 L168 188 L152 188 Z"
        fill="#0F6E56"
        opacity="0.55"
      />
    </svg>
  );
}

function SlideTwoIllustration() {
  const groups = [
    { cx: 72, cy: 88, highlight: false },
    { cx: 108, cy: 72, highlight: false },
    { cx: 248, cy: 92, highlight: false },
    { cx: 212, cy: 68, highlight: false },
    { cx: 160, cy: 56, highlight: true },
    { cx: 52, cy: 148, highlight: false },
    { cx: 268, cy: 152, highlight: false },
    { cx: 160, cy: 168, highlight: false },
  ];

  return (
    <svg viewBox="0 0 320 240" className="h-full w-full" aria-hidden>
      <circle cx="160" cy="120" r="88" fill="#04342C" opacity="0.04" />
      {groups.map((g, i) => (
        <g key={i}>
          <circle
            cx={g.cx}
            cy={g.cy}
            r={g.highlight ? 18 : 14}
            fill={g.highlight ? "#FAC775" : "#0F6E56"}
            opacity={g.highlight ? 0.85 : 0.35}
          />
          <ellipse
            cx={g.cx}
            cy={g.cy + (g.highlight ? 10 : 8)}
            rx={g.highlight ? 10 : 8}
            ry={g.highlight ? 6 : 5}
            fill={g.highlight ? "#04342C" : "#04342C"}
            opacity={g.highlight ? 0.5 : 0.25}
          />
        </g>
      ))}
    </svg>
  );
}

function SlideThreeIllustration() {
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full" aria-hidden>
      <ellipse cx="118" cy="148" rx="28" ry="18" fill="#0F6E56" opacity="0.45" />
      <path d="M104 166 Q118 178, 132 166 L128 188 L108 188 Z" fill="#0F6E56" opacity="0.45" />
      <ellipse cx="202" cy="148" rx="28" ry="18" fill="#04342C" opacity="0.55" />
      <path d="M188 166 Q202 178, 216 166 L212 188 L192 188 Z" fill="#04342C" opacity="0.55" />
      <rect x="72" y="88" width="56" height="28" rx="14" fill="#FAEEDA" stroke="#04342C" strokeOpacity="0.15" strokeWidth="1.5" />
      <rect x="82" y="98" width="36" height="4" rx="2" fill="#0F6E56" opacity="0.35" />
      <rect x="82" y="106" width="24" height="4" rx="2" fill="#0F6E56" opacity="0.25" />
      <rect x="192" y="72" width="64" height="32" rx="16" fill="#04342C" opacity="0.12" stroke="#04342C" strokeOpacity="0.2" strokeWidth="1.5" />
      <rect x="204" y="84" width="40" height="4" rx="2" fill="#04342C" opacity="0.35" />
      <rect x="204" y="92" width="28" height="4" rx="2" fill="#04342C" opacity="0.25" />
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
  void nickname;
  void onSkip;

  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);

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

  const finishDragRef = useRef(finishDrag);
  finishDragRef.current = finishDrag;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateWidth = () => {
      const measured = el.clientWidth;
      setViewportWidth(measured > 0 ? measured : window.innerWidth);
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let startX: number | null = null;
    let active = false;
    let usingTouch = false;

    const begin = (x: number) => {
      active = true;
      startX = x;
      setIsDragging(true);
      setDragOffset(0);
    };

    const move = (x: number) => {
      if (!active || startX === null) return;
      setDragOffset(startX - x);
    };

    const end = (x: number) => {
      if (!active || startX === null) return;
      const deltaX = startX - x;
      active = false;
      startX = null;
      setIsDragging(false);
      finishDragRef.current(deltaX);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (usingTouch || e.pointerType === "touch") return;
      if (e.button !== 0) return;
      begin(e.clientX);
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (usingTouch || !el.hasPointerCapture(e.pointerId)) return;
      move(e.clientX);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (usingTouch || !el.hasPointerCapture(e.pointerId)) return;
      el.releasePointerCapture(e.pointerId);
      end(e.clientX);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      usingTouch = true;
      begin(e.touches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active || e.touches.length !== 1 || startX === null) return;
      const x = e.touches[0].clientX;
      move(x);
      if (Math.abs(startX - x) > 8) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!active) return;
      const x = e.changedTouches[0]?.clientX ?? startX ?? 0;
      end(x);
      usingTouch = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  const slideWidth = Math.max(viewportWidth, 0);
  const slideStride = slideWidth + INTRO_SLIDE_GAP;
  const trackOffset = slideIndex * slideStride - dragOffset;

  const goNext = useCallback(() => {
    if (slideIndex < INTRO_SLIDES.length - 1) {
      onSlideChange(slideIndex + 1);
    } else {
      onStart();
    }
  }, [onSlideChange, onStart, slideIndex]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <img
        src="/logo-white.png"
        alt="heyven"
        className="mx-auto w-20 shrink-0"
      />

      <div className="flex min-h-0 flex-1 flex-col justify-center py-4">
        <div
          ref={viewportRef}
          className="relative z-10 w-full shrink-0 touch-pan-y overflow-hidden select-none"
          style={{ touchAction: "pan-y" }}
        >
          <div
            className={`pointer-events-none flex ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
            style={{
              gap: INTRO_SLIDE_GAP,
              transform: `translateX(-${trackOffset}px)`,
            }}
          >
            {INTRO_SLIDES.map((slide, index) => (
              <div
                key={introTitles[index]}
                className="glass-card pointer-events-none shrink-0 overflow-hidden p-5"
                style={{ width: slideWidth > 0 ? slideWidth : "100%" }}
                aria-hidden={index !== slideIndex}
              >
                <div className="h-36 w-full">
                  <slide.Illustration />
                </div>
                <h1 className={`pointer-events-none mt-4 ${ONBOARDING_TITLE}`}>
                  {introTitles[index]}
                </h1>
                <p className="pointer-events-none mt-2 text-base leading-relaxed text-cream/70">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-6">
        <div className="flex items-center justify-center gap-2">
          {INTRO_SLIDES.map((_, index) => (
            <div
              key={introTitles[index]}
              className={`rounded-full transition-all ${
                index === slideIndex
                  ? "h-1.5 w-6 bg-mint"
                  : "h-1.5 w-1.5 bg-cream/[0.28]"
              }`}
              aria-hidden
            />
          ))}
        </div>
        <button type="button" onClick={goNext} className={ONBOARDING_PRIMARY_BTN}>
          {slideIndex < INTRO_SLIDES.length - 1 ? "Continua" : "Inizia"}
        </button>
        <p className={ONBOARDING_SECONDARY_TEXT}>
          Hai già un account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className={ONBOARDING_SECONDARY_LINK}
          >
            Accedi
          </button>
        </p>
      </div>
    </main>
  );
}

function StepShell({
  progress,
  children,
}: {
  progress: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-dvh flex-col overflow-hidden px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <div className="mx-auto flex h-full w-full max-w-md min-h-0 flex-col">
        <div className="shrink-0">
          <img src="/logo-white.png" alt="heyven" className="mx-auto w-20" />
          <ProgressBar step={progress} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-6">{children}</div>
      </div>
    </main>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

function NicknameField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-4">
      <span className="field-label">{label}</span>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [phase, setPhase] = useState<Phase>("intro");
  const [introSlide, setIntroSlide] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step1bLoading, setStep1bLoading] = useState(false);
  const [step1bError, setStep1bError] = useState<string | null>(null);

  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const hasPrefilledNickname = useRef(false);

  useEffect(() => {
    if (phase !== "step1" || hasPrefilledNickname.current) return;
    hasPrefilledNickname.current = true;
    setNickname((current) => (current.trim() ? current : randomNickname()));
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
      setPhase("step1b");
    } else {
      setInfo("Ti abbiamo inviato una mail di conferma. Apri il link, poi torna qui e fai login.");
    }
  }

  async function onContinueStep1b() {
    setStep1bError(null);

    if (!birthDate) {
      setStep1bError("Inserisci la tua data di nascita.");
      return;
    }
    if (!isAtLeast18(birthDate)) {
      setStep1bError(
        "Heyven è pensato per un pubblico maggiorenne. Se sei in difficoltà, il Telefono Amico (02 2327 2327) è sempre disponibile per ascoltarti.",
      );
      return;
    }

    setStep1bLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStep1bLoading(false);
      setStep1bError("Sessione non trovata. Conferma l'email e accedi di nuovo.");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        birth_date: birthDate,
        city: city.trim() || null,
      })
      .eq("id", user.id);

    setStep1bLoading(false);

    if (updateError) {
      setStep1bError(updateError.message);
      return;
    }

    setPhase("step2");
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
    if (
      selectedSpace &&
      selectedSpace !== "non-lo-so" &&
      selectedSpace !== "vuole-aiutare"
    ) {
      destination = `/spazi/${selectedSpace}`;
    }
    document.cookie = "heyven_registered=true; path=/; max-age=31536000; SameSite=Lax";
    router.replace(destination);
    router.refresh();
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
        <h1 className={`mt-6 ${ONBOARDING_TITLE}`}>Crea il tuo rifugio</h1>
        <p className={`mt-2 ${ONBOARDING_SUBTITLE}`}>
          Il primo passo è anonimo.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <NicknameField label="Nickname anonimo">
            <div className="mb-1 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setNickname(randomNickname());
                  setError(null);
                }}
                className="text-xs font-medium text-cream/55 underline underline-offset-2 hover:text-cream/75"
              >
                ✦ Genera per me
              </button>
            </div>
            <input
              className="field-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="es. luna_silente"
              autoComplete="off"
              required
            />
            <p className="field-hint">
              Il nickname è l&apos;unico nome visibile. Nessuno saprà chi sei davvero.
            </p>
            {nicknameStatus === "taken" && (
              <p className={`mt-2 ${ONBOARDING_ERROR}`}>{NICKNAME_TAKEN_HINT}</p>
            )}
            {nicknameStatus === "checking" &&
              nickname.trim().length > 0 &&
              isValidNickname(nickname.trim()) && (
                <p className="field-hint">Verifica disponibilità…</p>
              )}
          </NicknameField>

          <FormField
            label="Indirizzo email"
            hint="Usata solo per recuperare l'accesso. Non sarà mai visibile ad altri."
          >
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@esempio.it"
              autoComplete="email"
              required
            />
          </FormField>

          <FormField label="Password">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Almeno 8 caratteri"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </FormField>

          {error && <p className={ONBOARDING_ERROR}>{error}</p>}
          {info && <p className={ONBOARDING_INFO}>{info}</p>}

          <button type="submit" disabled={submitDisabled} className={ONBOARDING_PRIMARY_BTN}>
            {loading ? "Creazione…" : "Crea il mio spazio"}
          </button>
        </form>

        <p className={`mt-5 ${ONBOARDING_SECONDARY_TEXT}`}>
          Hai già un account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className={ONBOARDING_SECONDARY_LINK}
          >
            Accedi
          </Link>
        </p>
      </StepShell>
    );
  }

  if (phase === "step1b") {
    return (
      <StepShell progress={2}>
        <h1 className={`mt-6 ${ONBOARDING_TITLE}`}>Quasi fatto</h1>
        <p className={`mt-2 ${ONBOARDING_SUBTITLE}`}>
          Due dettagli in più, poi si va avanti.
        </p>

        <div className="mt-6 space-y-4">
          <FormField label="Data di nascita">
            <input
              type="date"
              className="field-input [color-scheme:dark]"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              autoComplete="bday"
              required
            />
          </FormField>

          <FormField
            label="In che città vivi?"
            hint="Facoltativo — ci aiuta a mostrarti risorse vicino a te."
          >
            <input
              type="text"
              className="field-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
            />
          </FormField>

          {step1bError && <p className={ONBOARDING_ERROR}>{step1bError}</p>}

          <button
            type="button"
            onClick={onContinueStep1b}
            disabled={step1bLoading}
            className={ONBOARDING_PRIMARY_BTN}
          >
            {step1bLoading ? "Salvataggio…" : "Continua →"}
          </button>
        </div>
      </StepShell>
    );
  }

  if (phase === "step2") {
    const spaceOptions = [
      ...SPACES.map((space) => ({
        slug: space.slug,
        emoji: space.emoji,
        label: FEELING_LABELS[space.slug],
      })),
      ...EXTRA_FEELING_OPTIONS,
    ];
    const canContinue = Boolean(selectedSpace && selectedDuration) && !step2Loading;

    return (
      <StepShell progress={3}>
        <h1 className={`mt-6 ${ONBOARDING_TITLE}`}>
          Trova il tuo spazio
        </h1>
        <p className={`mt-2 ${ONBOARDING_SUBTITLE}`}>
          Non serve avere le parole giuste. Scegli quello che ti sembra più vicino.
        </p>

        <div className="mt-6 space-y-6">
          <section>
            <h2 className="field-label">
              Cosa ti pesa di più in questo periodo?
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {spaceOptions.map((space) => {
                const active = selectedSpace === space.slug;
                return (
                  <button
                    key={space.slug}
                    type="button"
                    onClick={() => setSelectedSpace(space.slug)}
                    className={
                      "glass-card p-3 text-left text-sm leading-snug transition-all active:scale-[0.98] " +
                      (active
                        ? "border-mint shadow-[0_0_0_1px_rgba(93,202,165,0.35),0_0_20px_-4px_rgba(93,202,165,0.25)] text-cream"
                        : "text-cream/75 hover:bg-cream/[0.04]")
                    }
                  >
                    {space.emoji} {space.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="field-label">
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
                      "rounded-full px-4 py-2 text-sm transition-all active:scale-[0.98] " +
                      (active
                        ? "border border-mint bg-mint/10 font-medium text-cream shadow-[0_0_16px_-4px_rgba(93,202,165,0.3)]"
                        : "glass-card text-cream/75 hover:bg-cream/[0.04]")
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {step2Error && <p className={`mt-4 ${ONBOARDING_INFO}`}>{step2Error}</p>}

        <button
          type="button"
          onClick={onContinueStep2}
          disabled={!canContinue}
          className={`mt-6 ${ONBOARDING_PRIMARY_BTN}`}
        >
          {step2Loading ? "Salvataggio…" : "Continua →"}
        </button>
      </StepShell>
    );
  }

  return (
    <StepShell progress={4}>
      <h1 className={`mt-6 ${ONBOARDING_TITLE}`}>Scopri chi c&apos;è</h1>
      <p className={`mt-2 ${ONBOARDING_SUBTITLE}`}>
        Qualcuno ha già scritto quello che forse stavi cercando le parole per dire.
      </p>

      <div className="mt-6 space-y-3">
        {PREVIEW_POSTS.map((post) => (
          <article key={post.nickname} className="glass-card p-5">
            <header className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-[14px] text-sm font-medium text-petrolio"
                style={{ backgroundColor: post.avatarBg }}
              >
                {post.nickname.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-cream">@{post.nickname}</p>
                <p className="text-xs text-cream/55">
                  {post.emoji} {post.space}
                </p>
              </div>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">{post.content}</p>
            <p className="mt-3 text-xs text-cream/45">
              💚 Anch&apos;io · {post.meToo} · 💬 {post.replies} risposte
            </p>
          </article>
        ))}

        <article
          className="glass-card p-5"
          style={{
            background:
              "linear-gradient(145deg, rgba(15, 110, 86, 0.35) 0%, rgba(4, 52, 44, 0.55) 100%)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-cream/10 text-sm font-semibold text-cream">
              S
            </div>
            <div>
              <p className="font-medium text-cream">Sara · Mentore</p>
              <p className="text-xs text-cream/55">
                Ha attraversato l&apos;ansia, qui da 8 mesi
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm italic leading-relaxed text-cream/80">
            &ldquo;Sono qui perché qualcuno c&apos;è stato per me quando ne avevo bisogno. Adesso
            voglio fare lo stesso.&rdquo;
          </p>
        </article>

        {selectedSpace === "vuole-aiutare" && (
          <div className="glass-card p-4">
            <p className="text-sm font-medium text-cream">Grazie di cuore 💚</p>
            <p className="mt-1 text-sm leading-relaxed text-cream/70">
              Quando sarai più presente nella community, potrai candidarti come Mentore. Te lo
              faremo sapere.
            </p>
          </div>
        )}
      </div>

      <button type="button" onClick={onEnterHeyven} className={`mt-4 ${ONBOARDING_PRIMARY_BTN}`}>
        Entra in Heyven ✦
      </button>
    </StepShell>
  );
}
