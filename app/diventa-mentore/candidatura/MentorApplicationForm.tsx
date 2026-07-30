"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ApplicationStepper from "@/components/mentor/ApplicationStepper";
import CustomAreaTagsInput from "@/components/mentor/CustomAreaTagsInput";
import { createClient } from "@/lib/supabase/client";
import { submitMentorApplication } from "@/lib/mentor-application";

const DRAFT_KEY = "heyven_mentor_draft";

const MESSAGE_CLASS =
  "rounded-xl bg-[#D4EDE5] px-3 py-2 text-sm text-[#04342C]";

const TITLE = "font-display text-[25px] leading-tight text-cream";
const INTRO = "text-[16px] leading-[1.6] text-cream/[0.72]";
const PRIMARY_BTN =
  "w-full rounded-[14px] bg-cream py-4 text-[15px] font-semibold text-petrolio transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

const EXPERIENCE_AREAS = [
  { label: "Ansia", slug: "ansia" },
  { label: "Depressione", slug: "depressione" },
  { label: "Disturbi alimentari", slug: "dca" },
  { label: "Burnout", slug: "burnout" },
  { label: "Relazioni difficili", slug: "relazioni" },
  { label: "Solitudine", slug: "solitudine" },
  { label: "Lutto", slug: "lutto" },
  { label: "Identità", slug: "identita" },
  { label: "Altro", slug: "altro" },
] as const;

const WEEKLY_OPTIONS = [
  "Meno di 2 ore",
  "2-4 ore",
  "Più di 4 ore",
] as const;

type Step = 1 | 2 | 3 | 4;

type Draft = {
  step: Step;
  fullName: string;
  email: string;
  phone: string;
  birthYear: string;
  city: string;
  experienceSlugs: string[];
  customAreaTags: string[];
  customAreaNote: string;
  listeningBackground: string;
  weeklyAvailability: string;
  qWhy: string;
  qListened: string;
  qCrisis: string;
  consentData: boolean;
  consentTruth: boolean;
};

const EMPTY_DRAFT: Draft = {
  step: 1,
  fullName: "",
  email: "",
  phone: "",
  birthYear: "",
  city: "",
  experienceSlugs: [],
  customAreaTags: [],
  customAreaNote: "",
  listeningBackground: "",
  weeklyAvailability: "",
  qWhy: "",
  qListened: "",
  qCrisis: "",
  consentData: false,
  consentTruth: false,
};

type FieldKey =
  | "fullName"
  | "email"
  | "birthYear"
  | "city"
  | "experienceSlugs"
  | "weeklyAvailability"
  | "qWhy"
  | "qListened"
  | "qCrisis"
  | "customAreaNote";

function loadDraft(): Draft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<Draft> & {
      customAreaNote?: string;
      customAreaTags?: string[];
    };
    const customAreaTags =
      parsed.customAreaTags ??
      (parsed.customAreaNote
        ? parsed.customAreaNote
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []);
    return { ...EMPTY_DRAFT, ...parsed, customAreaTags };
  } catch {
    return EMPTY_DRAFT;
  }
}

function chipClass(active: boolean) {
  return active
    ? "border-mint bg-[rgba(93,202,165,0.15)] text-mint"
    : "border-[rgba(245,239,227,0.28)] bg-[rgba(245,239,227,0.06)] text-cream/[0.72]";
}

function fieldErrorClass(hasError: boolean) {
  return hasError
    ? "border-mint/60 shadow-[0_0_0_1px_rgba(93,202,165,0.5),0_0_0_4px_rgba(93,202,165,0.12)]"
    : "";
}

export default function MentorApplicationForm() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<Set<FieldKey>>(new Set());
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const loaded = loadDraft();
    setDraft(loaded);
    setStep(loaded.step);
    setHydrated(true);
  }, []);

  const updateDraft = useCallback(
    (patch: Partial<Draft>) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const goToStep = useCallback(
    (next: Step) => {
      if (prefersReducedMotion.current) {
        setStep(next);
        updateDraft({ step: next });
        setFadeIn(true);
        return;
      }
      setFadeIn(false);
      window.setTimeout(() => {
        setStep(next);
        updateDraft({ step: next });
        setFadeIn(true);
      }, 250);
    },
    [updateDraft],
  );

  function toggleArea(slug: string) {
    setFieldErrors((e) => {
      const n = new Set(e);
      n.delete("experienceSlugs");
      return n;
    });
    setDraft((prev) => {
      let slugs = [...prev.experienceSlugs];
      if (slugs.includes(slug)) {
        slugs = slugs.filter((s) => s !== slug);
      } else if (slugs.length >= 3) {
        slugs = [...slugs.slice(1), slug];
      } else {
        slugs.push(slug);
      }
      const next = {
        ...prev,
        experienceSlugs: slugs,
        customAreaTags: slugs.includes("altro") ? prev.customAreaTags : [],
        customAreaNote: slugs.includes("altro") ? prev.customAreaNote : "",
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function validateStep1(): boolean {
    const errors = new Set<FieldKey>();
    if (!draft.fullName.trim()) errors.add("fullName");
    if (!draft.email.trim()) errors.add("email");
    const year = Number(draft.birthYear);
    if (!draft.birthYear || Number.isNaN(year) || year < 1940 || year > 2008) {
      errors.add("birthYear");
    }
    if (!draft.city.trim()) errors.add("city");
    setFieldErrors(errors);
    return errors.size === 0;
  }

  function validateStep2(): boolean {
    const errors = new Set<FieldKey>();
    if (draft.experienceSlugs.length === 0) errors.add("experienceSlugs");
    if (draft.experienceSlugs.includes("altro") && draft.customAreaTags.length === 0) {
      errors.add("customAreaNote");
    }
    if (!draft.weeklyAvailability) errors.add("weeklyAvailability");
    setFieldErrors(errors);
    return errors.size === 0;
  }

  function validateStep3(): boolean {
    const errors = new Set<FieldKey>();
    if (!draft.qWhy.trim()) errors.add("qWhy");
    if (!draft.qListened.trim()) errors.add("qListened");
    if (!draft.qCrisis.trim()) errors.add("qCrisis");
    setFieldErrors(errors);
    return errors.size === 0;
  }

  function validateAll(): boolean {
    const errors = new Set<FieldKey>();
    if (!draft.fullName.trim()) errors.add("fullName");
    if (!draft.email.trim()) errors.add("email");
    const year = Number(draft.birthYear);
    if (!draft.birthYear || Number.isNaN(year) || year < 1940 || year > 2008) {
      errors.add("birthYear");
    }
    if (!draft.city.trim()) errors.add("city");
    if (draft.experienceSlugs.length === 0) errors.add("experienceSlugs");
    if (draft.experienceSlugs.includes("altro") && draft.customAreaTags.length === 0) {
      errors.add("customAreaNote");
    }
    if (!draft.weeklyAvailability) errors.add("weeklyAvailability");
    if (!draft.qWhy.trim()) errors.add("qWhy");
    if (!draft.qListened.trim()) errors.add("qListened");
    if (!draft.qCrisis.trim()) errors.add("qCrisis");
    setFieldErrors(errors);
    return errors.size === 0;
  }

  function mapServerFields(fields?: string[]) {
    if (!fields?.length) return;
    const map: Record<string, FieldKey> = {
      p_full_name: "fullName",
      p_email: "email",
      p_birth_year: "birthYear",
      p_city: "city",
      p_experience_areas: "experienceSlugs",
      p_custom_area_note: "customAreaNote",
      p_weekly_availability: "weeklyAvailability",
      p_q_why: "qWhy",
      p_q_listened: "qListened",
      p_q_crisis: "qCrisis",
    };
    const errors = new Set<FieldKey>();
    for (const f of fields) {
      const key = map[f];
      if (key) errors.add(key);
    }
    if (errors.size === 0) validateAll();
    else setFieldErrors(errors);
  }

  function onContinue(e?: FormEvent) {
    e?.preventDefault();
    setInlineMessage(null);
    if (step === 1 && validateStep1()) goToStep(2);
    else if (step === 2 && validateStep2()) goToStep(3);
    else if (step === 3 && validateStep3()) goToStep(4);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setInlineMessage(null);
    if (!draft.consentData || !draft.consentTruth) return;
    if (!validateAll()) {
      setInlineMessage("Controlla i campi evidenziati e riprova.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const result = await submitMentorApplication(supabase, {
      p_full_name: draft.fullName.trim(),
      p_email: draft.email.trim(),
      p_phone: draft.phone.trim() || null,
      p_birth_year: Number(draft.birthYear),
      p_city: draft.city.trim(),
      p_experience_areas: draft.experienceSlugs,
      p_custom_area_note: draft.experienceSlugs.includes("altro")
        ? draft.customAreaTags.join(", ") || null
        : null,
      p_listening_background: draft.listeningBackground.trim(),
      p_weekly_availability: draft.weeklyAvailability,
      p_q_why: draft.qWhy.trim(),
      p_q_listened: draft.qListened.trim(),
      p_q_crisis: draft.qCrisis.trim(),
    });
    setSubmitting(false);

    if (result.status === "success") {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push("/diventa-mentore/candidatura/inviata");
      return;
    }
    if (result.status === "already_open") {
      setInlineMessage(
        "Abbiamo già una tua candidatura in corso. Ti scriviamo noi, promesso.",
      );
      return;
    }
    if (result.status === "cooldown") {
      setInlineMessage(
        `Ci siamo già sentiti di recente. Puoi riprovare dal ${result.retryLabel}.`,
      );
      return;
    }
    if (result.status === "missing_fields") {
      mapServerFields(result.fields);
      setInlineMessage("Controlla i campi evidenziati e riprova.");
      return;
    }
    setInlineMessage(
      "Qualcosa non ha funzionato. I tuoi dati sono salvi nella bozza, riprova tra poco.",
    );
  }

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className={TITLE}>Chi sei</h2>
              <p className={`mt-3 ${INTRO}`}>
                Sulla piattaforma resti @nickname e basta, nessuno vedrà il tuo
                nome. Ma per farti parlare con altre persone qui dentro dobbiamo
                sapere chi sei.
              </p>
            </div>
            <div>
              <label className="field-label" htmlFor="fullName">
                Nome e cognome
              </label>
              <input
                id="fullName"
                className={`field-input mt-2 ${fieldErrorClass(fieldErrors.has("fullName"))}`}
                value={draft.fullName}
                onChange={(ev) => {
                  setFieldErrors((e) => {
                    const n = new Set(e);
                    n.delete("fullName");
                    return n;
                  });
                  updateDraft({ fullName: ev.target.value });
                }}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`field-input mt-2 ${fieldErrorClass(fieldErrors.has("email"))}`}
                value={draft.email}
                onChange={(ev) => {
                  setFieldErrors((e) => {
                    const n = new Set(e);
                    n.delete("email");
                    return n;
                  });
                  updateDraft({ email: ev.target.value });
                }}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="phone">
                Telefono
              </label>
              <input
                id="phone"
                type="tel"
                className="field-input mt-2"
                value={draft.phone}
                onChange={(ev) => updateDraft({ phone: ev.target.value })}
                autoComplete="tel"
              />
              <p className="field-hint">Facoltativo</p>
            </div>
            <div>
              <label className="field-label" htmlFor="birthYear">
                Anno di nascita
              </label>
              <input
                id="birthYear"
                type="number"
                min={1940}
                max={2008}
                className={`field-input mt-2 [color-scheme:dark] ${fieldErrorClass(fieldErrors.has("birthYear"))}`}
                value={draft.birthYear}
                onChange={(ev) => {
                  setFieldErrors((e) => {
                    const n = new Set(e);
                    n.delete("birthYear");
                    return n;
                  });
                  updateDraft({ birthYear: ev.target.value });
                }}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="city">
                Città
              </label>
              <input
                id="city"
                className={`field-input mt-2 ${fieldErrorClass(fieldErrors.has("city"))}`}
                value={draft.city}
                onChange={(ev) => {
                  setFieldErrors((e) => {
                    const n = new Set(e);
                    n.delete("city");
                    return n;
                  });
                  updateDraft({ city: ev.target.value });
                }}
                autoComplete="address-level2"
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className={TITLE}>Dove ti senti a casa</h2>
              <p className={`mt-3 ${INTRO}`}>
                Ci serve solo per capire con chi metterti in contatto: chi ti
                scriverà avrà vissuto qualcosa di simile.
              </p>
              <p className="mt-2 text-sm text-cream/60">
                Puoi sceglierne fino a tre. Se non trovi la tua, aggiungila.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_AREAS.map(({ label, slug }) => {
                const active = draft.experienceSlugs.includes(slug);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => toggleArea(slug)}
                    className={`rounded-full border px-3.5 py-2 text-[14px] leading-snug transition-colors duration-200 ease-out motion-reduce:transition-none ${chipClass(active)}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {fieldErrors.has("experienceSlugs") && (
              <p className={MESSAGE_CLASS}>Scegli almeno un&apos;area.</p>
            )}
            {draft.experienceSlugs.includes("altro") && (
              <CustomAreaTagsInput
                tags={draft.customAreaTags}
                hasError={fieldErrors.has("customAreaNote")}
                onChange={(customAreaTags) => {
                  setFieldErrors((e) => {
                    const n = new Set(e);
                    n.delete("customAreaNote");
                    return n;
                  });
                  updateDraft({
                    customAreaTags,
                    customAreaNote: customAreaTags.join(", "),
                  });
                }}
              />
            )}
            <div>
              <label className="field-label" htmlFor="listening">
                Hai già ascoltato qualcuno? (volontariato, gruppi, peer education,
                anche solo nella vita)
              </label>
              <textarea
                id="listening"
                rows={3}
                className="field-input mt-2 min-h-[88px]"
                value={draft.listeningBackground}
                onChange={(ev) =>
                  updateDraft({ listeningBackground: ev.target.value })
                }
              />
            </div>
            <div className="space-y-3">
              <p className="field-label normal-case tracking-normal">
                Quanto tempo puoi darci a settimana?
              </p>
              <div className="flex flex-wrap gap-2">
                {WEEKLY_OPTIONS.map((opt) => {
                  const active = draft.weeklyAvailability === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setFieldErrors((e) => {
                          const n = new Set(e);
                          n.delete("weeklyAvailability");
                          return n;
                        });
                        updateDraft({ weeklyAvailability: opt });
                      }}
                      className={`rounded-full border px-3.5 py-2 text-[14px] leading-snug transition-colors duration-200 ease-out motion-reduce:transition-none ${chipClass(active)} ${fieldErrors.has("weeklyAvailability") && !active ? "border-mint/40" : ""}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <h2 className={TITLE}>Tre domande</h2>
            <div>
              <label className="field-label" htmlFor="qWhy">
                Cosa ti ha portato qui?
              </label>
              <textarea
                id="qWhy"
                className={`field-input mt-2 min-h-[120px] ${fieldErrorClass(fieldErrors.has("qWhy"))}`}
                value={draft.qWhy}
                onChange={(ev) => {
                  setFieldErrors((e) => {
                    const n = new Set(e);
                    n.delete("qWhy");
                    return n;
                  });
                  updateDraft({ qWhy: ev.target.value });
                }}
                onInput={(ev) => {
                  const t = ev.currentTarget;
                  t.style.height = "auto";
                  t.style.height = `${Math.max(120, t.scrollHeight)}px`;
                }}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="qListened">
                Raccontaci una volta in cui qualcuno ti ha ascoltato davvero.
              </label>
              <textarea
                id="qListened"
                className={`field-input mt-2 min-h-[120px] ${fieldErrorClass(fieldErrors.has("qListened"))}`}
                value={draft.qListened}
                onChange={(ev) => {
                  setFieldErrors((e) => {
                    const n = new Set(e);
                    n.delete("qListened");
                    return n;
                  });
                  updateDraft({ qListened: ev.target.value });
                }}
                onInput={(ev) => {
                  const t = ev.currentTarget;
                  t.style.height = "auto";
                  t.style.height = `${Math.max(120, t.scrollHeight)}px`;
                }}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="qCrisis">
                Una persona ti scrive che non ce la fa più. Cosa le rispondi?
              </label>
              <textarea
                id="qCrisis"
                className={`field-input mt-2 min-h-[120px] ${fieldErrorClass(fieldErrors.has("qCrisis"))}`}
                value={draft.qCrisis}
                onChange={(ev) => {
                  setFieldErrors((e) => {
                    const n = new Set(e);
                    n.delete("qCrisis");
                    return n;
                  });
                  updateDraft({ qCrisis: ev.target.value });
                }}
                onInput={(ev) => {
                  const t = ev.currentTarget;
                  t.style.height = "auto";
                  t.style.height = `${Math.max(120, t.scrollHeight)}px`;
                }}
              />
              <p className="mt-2 text-sm text-cream/60">
                Non c&apos;è la risposta giusta. Scrivi quello che diresti.
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className={TITLE}>Prima di inviare</h2>
            <label className="flex cursor-pointer items-start gap-3 text-[16px] leading-[1.6] text-cream">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 rounded border-cream/30 bg-cream/5 accent-mint"
                checked={draft.consentData}
                onChange={(ev) =>
                  updateDraft({ consentData: ev.target.checked })
                }
              />
              <span>
                Ho letto{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-mint underline underline-offset-2"
                >
                  come Heyven tratta i miei dati
                </Link>{" "}
                e acconsento.
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-[16px] leading-[1.6] text-cream">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 shrink-0 rounded border-cream/30 bg-cream/5 accent-mint"
                checked={draft.consentTruth}
                onChange={(ev) =>
                  updateDraft({ consentTruth: ev.target.checked })
                }
              />
              <span>Quello che ho scritto è vero.</span>
            </label>
          </div>
        );
      default:
        return null;
    }
  }, [step, draft, fieldErrors, updateDraft]);

  if (!hydrated) {
    return null;
  }

  const canSubmitStep4 = draft.consentData && draft.consentTruth && !submitting;

  return (
    <main className="flex flex-col px-6 pb-6 pt-[calc(6.5rem+env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => goToStep((step - 1) as Step)}
              className="mb-4 text-sm font-medium text-cream/70 transition-colors hover:text-cream"
            >
              Indietro
            </button>
          ) : (
            <div className="mb-4 h-5" aria-hidden />
          )}
          <ApplicationStepper step={step} />
        </div>

        <form
          onSubmit={step === 4 ? onSubmit : onContinue}
          className="mt-8 flex min-h-0 flex-1 flex-col"
        >
          <div
            className={`min-h-0 flex-1 transition-opacity duration-[250ms] ease-out motion-reduce:transition-none ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            {stepContent}
            {inlineMessage && (
              <p className={`mt-4 ${MESSAGE_CLASS}`}>{inlineMessage}</p>
            )}
          </div>

          <div className="sticky bottom-0 mt-8 shrink-0 bg-gradient-to-t from-[#0a2b25] via-[#0a2b25] to-transparent pb-[env(safe-area-inset-bottom)] pt-4">
            <button
              type="submit"
              className={PRIMARY_BTN}
              disabled={step === 4 ? !canSubmitStep4 : submitting}
            >
              {step === 4
                ? submitting
                  ? "Invio…"
                  : "Invia la candidatura"
                : "Continua"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
