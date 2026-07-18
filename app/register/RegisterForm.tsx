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

type Phase = "splash" | "intro" | "step1" | "step1b" | "step2" | "step3";
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
            segment <= step ? "bg-[#04342C]" : "bg-[#04342C]/15"
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

  const currentSlide = INTRO_SLIDES[slideIndex];

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#FAEEDA]">
      <img
        src="/logo-green.png"
        alt="heyven"
        className="mx-auto w-20 shrink-0 pt-8"
      />

      <div className="flex min-h-0 flex-1 flex-col justify-evenly">
        <div
          ref={viewportRef}
          className="h-40 w-full shrink-0 touch-pan-y overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <div
            className={`flex h-full ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
            style={{
              gap: INTRO_SLIDE_GAP,
              transform: `translateX(-${trackOffset}px)`,
            }}
          >
            {INTRO_SLIDES.map((slide, index) => (
              <div
                key={introTitles[index]}
                className="h-full shrink-0"
                style={{ width: slideWidth > 0 ? slideWidth : "100%" }}
                aria-hidden={index !== slideIndex}
              >
                <slide.Illustration />
              </div>
            ))}
          </div>
        </div>

        <h1 className="mt-2 px-8 text-center text-2xl font-bold text-[#04342C] transition-all duration-300">
          {introTitles[slideIndex]}
        </h1>

        <p className="mt-1 px-8 text-center text-base leading-relaxed text-[#4A6158]">
          {currentSlide.description}
        </p>
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-6 px-6 pb-6">
        <div className="flex items-center justify-center gap-2">
          {INTRO_SLIDES.map((_, index) => (
            <div
              key={introTitles[index]}
              className={`h-2 rounded-full transition-all ${
                index === slideIndex
                  ? "w-6 bg-[#04342C]"
                  : "w-2 bg-[#04342C]/20"
              }`}
              aria-hidden
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="w-full rounded-2xl bg-[#04342C] py-4 font-semibold text-[#FAEEDA] transition active:scale-[0.99]"
        >
          {slideIndex < INTRO_SLIDES.length - 1 ? "Continua" : "Inizia"}
        </button>
        <p className="text-center text-sm text-[#4A6158]">
          Hai già un account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-semibold text-[#04342C] underline underline-offset-2"
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
    <main className="flex h-dvh flex-col overflow-hidden bg-[#FAEEDA] px-6">
      <div className="mx-auto flex h-full w-full max-w-md min-h-0 flex-col">
        <div className="shrink-0 pt-8">
          <img
            src="/logo-green.png"
            alt="heyven"
            className="mx-auto w-20"
          />
          <ProgressBar step={progress} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-6">{children}</div>
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
      <span className="text-sm font-medium text-[#4A6158]">{label}</span>
      {children}
      {hint && <p className="mt-1.5 text-xs text-[#7A9188]">{hint}</p>}
    </label>
  );
}

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[#04342C]/15 bg-white/60 px-4 py-3 text-[#04342C] outline-none placeholder:text-[#7A9188] focus:border-[#04342C]/40";

export default function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [phase, setPhase] = useState<Phase>("splash");
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
    if (phase === "splash") {
      const t = setTimeout(() => setPhase("intro"), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

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
          className="animate-[fadeInScale_1.4s_ease-out_forwards]"
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
        <h1 className="mt-6 text-2xl font-semibold text-[#04342C]">Crea il tuo rifugio</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#4A6158]">
          Il primo passo è anonimo.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-3xl border border-white/60 bg-white/50 p-5 shadow-sm"
        >
          <div className="space-y-4">
            <GlassInput label="Nickname anonimo">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setNickname(randomNickname());
                    setError(null);
                  }}
                  className="text-xs font-medium text-[#4A6158] underline underline-offset-2"
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
              <p className="mt-1.5 text-xs text-[#7A9188]">
                Il nickname è l&apos;unico nome visibile. Nessuno saprà chi sei davvero.
              </p>
              {nicknameStatus === "taken" && (
                <p className="mt-1.5 text-xs text-[#7A9188]">{NICKNAME_TAKEN_HINT}</p>
              )}
              {nicknameStatus === "checking" &&
                nickname.trim().length > 0 &&
                isValidNickname(nickname.trim()) && (
                  <p className="mt-1.5 text-xs text-[#7A9188]">Verifica disponibilità…</p>
                )}
            </GlassInput>

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
            <p className="mt-4 rounded-xl bg-[#D4EDE5] px-3 py-2 text-sm text-[#04342C]">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-4 rounded-2xl border border-[#04342C]/10 bg-white/60 px-3 py-2 text-sm text-[#04342C]">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={submitDisabled}
            className="mt-4 w-full rounded-2xl bg-[#04342C] py-4 font-semibold text-[#FAEEDA] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creazione…" : "Crea il mio spazio"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#4A6158]">
          Hai già un account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[#04342C] underline underline-offset-2"
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
        <h1 className="mt-6 text-2xl font-semibold text-[#04342C]">Quasi fatto</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#4A6158]">
          Due dettagli in più, poi si va avanti.
        </p>

        <div className="mt-6 space-y-4 rounded-3xl border border-white/60 bg-white/50 p-5 shadow-sm">
          <GlassInput label="Data di nascita">
            <input
              type="date"
              className={inputClassName}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              autoComplete="bday"
              required
            />
          </GlassInput>

          <GlassInput
            label="In che città vivi?"
            hint="Facoltativo — ci aiuta a mostrarti risorse vicino a te."
          >
            <input
              type="text"
              className={inputClassName}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
            />
          </GlassInput>

          {step1bError && (
            <p className="rounded-xl bg-[#D4EDE5] px-3 py-2 text-sm text-[#04342C]">
              {step1bError}
            </p>
          )}

          <button
            type="button"
            onClick={onContinueStep1b}
            disabled={step1bLoading}
            className="w-full rounded-2xl bg-[#04342C] py-4 font-semibold text-[#FAEEDA] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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
        <h1 className="mt-6 text-2xl font-semibold text-[#04342C]">
          Trova il tuo spazio
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#4A6158]">
          Non serve avere le parole giuste. Scegli quello che ti sembra più vicino.
        </p>

        <div className="mt-6 space-y-6">
          <section>
            <h2 className="text-sm font-medium text-[#4A6158]">
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
                        ? "rounded-full bg-[#04342C] px-4 py-2 text-sm font-medium text-[#FAEEDA]"
                        : "rounded-full border border-[#04342C]/20 bg-white/40 px-4 py-2 text-sm text-[#4A6158]"
                    }
                  >
                    {space.emoji} {space.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-[#4A6158]">
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
                        ? "rounded-full bg-[#04342C] px-4 py-2 text-sm font-medium text-[#FAEEDA]"
                        : "rounded-full border border-[#04342C]/20 bg-white/40 px-4 py-2 text-sm text-[#4A6158]"
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
          <p className="mt-4 rounded-2xl border border-[#04342C]/10 bg-white/60 px-3 py-2 text-sm text-[#04342C]">
            {step2Error}
          </p>
        )}

        <button
          type="button"
          onClick={onContinueStep2}
          disabled={!canContinue}
          className="mt-6 w-full rounded-2xl bg-[#04342C] py-4 font-semibold text-[#FAEEDA] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {step2Loading ? "Salvataggio…" : "Continua →"}
        </button>
      </StepShell>
    );
  }

  return (
    <StepShell progress={4}>
      <h1 className="mt-6 text-2xl font-semibold text-[#04342C]">Scopri chi c&apos;è</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#4A6158]">
        Qualcuno ha già scritto quello che forse stavi cercando le parole per dire.
      </p>

      <div className="mt-6 space-y-3">
        {PREVIEW_POSTS.map((post) => (
          <article
            key={post.nickname}
            className="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-sm"
          >
            <header className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-[#04342C]"
                style={{ backgroundColor: post.avatarBg }}
              >
                {post.nickname.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-[#04342C]">@{post.nickname}</p>
                <p className="text-xs text-[#4A6158]">
                  {post.emoji} {post.space}
                </p>
              </div>
            </header>
            <p className="mt-3 text-sm leading-relaxed text-[#4A6158]">{post.content}</p>
            <p className="mt-3 text-xs text-[#7A9188]">
              💚 Anch&apos;io · {post.meToo} · 💬 {post.replies} risposte
            </p>
          </article>
        ))}

        <article className="mt-2 rounded-3xl bg-[#04342C] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAEEDA]/20 text-sm font-semibold text-[#FAEEDA]">
              S
            </div>
            <div>
              <p className="font-medium text-[#FAEEDA]">Sara · Mentore</p>
              <p className="text-xs text-[#FAEEDA]/70">
                Ha attraversato l&apos;ansia, qui da 8 mesi
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm italic leading-relaxed text-[#FAEEDA]/90">
            &ldquo;Sono qui perché qualcuno c&apos;è stato per me quando ne avevo bisogno. Adesso
            voglio fare lo stesso.&rdquo;
          </p>
        </article>

        {selectedSpace === "vuole-aiutare" && (
          <div className="mt-3 rounded-2xl border border-[#04342C]/15 bg-white/50 p-4">
            <p className="text-sm font-medium text-[#04342C]">Grazie di cuore 💚</p>
            <p className="mt-1 text-sm leading-relaxed text-[#4A6158]">
              Quando sarai più presente nella community, potrai candidarti come Mentore. Te lo
              faremo sapere.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onEnterHeyven}
        className="mt-4 w-full rounded-2xl bg-[#04342C] py-4 font-semibold text-[#FAEEDA] transition active:scale-[0.99]"
      >
        Entra in Heyven ✦
      </button>
    </StepShell>
  );
}
