"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SectionLabel from "@/components/SectionLabel";
import { createClient } from "@/lib/supabase/client";
import {
  MOODS,
  MOOD_TAGS,
  localDateISO,
  tagByKey,
  type MoodKey,
  type MoodTagKey,
} from "@/lib/moods";
import {
  getCheckinForDate,
  getPopularMoodTags,
  submitCheckin,
  type DailyCheckin,
} from "@/lib/check-in-rpc";

type Step = "pick" | "tags";
type ConfirmPhase = "hidden" | "out" | "in";

const CONFIRM_HOLD_MS = 4000;
const CONFIRM_FADE_MS = 500;

export default function HomeCheckIn() {
  const supabase = useMemo(() => createClient(), []);

  const [weather, setWeather] = useState<MoodKey | null>(null);
  const [tags, setTags] = useState<MoodTagKey[]>([]);
  const [step, setStep] = useState<Step>("pick");
  const [savedRow, setSavedRow] = useState<DailyCheckin | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [tagOrder, setTagOrder] = useState<MoodTagKey[]>(() =>
    MOOD_TAGS.map((t) => t.key),
  );
  const [confirm, setConfirm] = useState<ConfirmPhase>("hidden");
  const confirmTimers = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data }, popular] = await Promise.all([
        getCheckinForDate(supabase, localDateISO()),
        getPopularMoodTags(supabase),
      ]);
      if (cancelled) return;
      if (data) {
        setSavedRow(data);
        setWeather(data.weather);
        setTags(data.tags);
        setStep("tags");
      }
      setTagOrder(popular);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const orderedTags = useMemo(
    () => tagOrder.map(tagByKey).filter((t) => t != null),
    [tagOrder],
  );

  function clearConfirmTimers() {
    for (const id of confirmTimers.current) window.clearTimeout(id);
    confirmTimers.current = [];
  }

  function hideConfirm() {
    clearConfirmTimers();
    setConfirm("hidden");
  }

  function showConfirm() {
    clearConfirmTimers();
    setConfirm("out");
    const fadeIn = window.setTimeout(() => setConfirm("in"), 20);
    const fadeOut = window.setTimeout(() => setConfirm("out"), CONFIRM_HOLD_MS);
    const hide = window.setTimeout(
      () => setConfirm("hidden"),
      CONFIRM_HOLD_MS + CONFIRM_FADE_MS,
    );
    confirmTimers.current = [fadeIn, fadeOut, hide];
  }

  useEffect(() => () => clearConfirmTimers(), []);

  function onPickWeather(next: MoodKey) {
    setHasError(false);
    hideConfirm();
    setWeather(next);
    if (step === "pick") setStep("tags");
  }

  function toggleTag(key: MoodTagKey) {
    setHasError(false);
    hideConfirm();
    setTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key],
    );
  }

  function skipTags() {
    hideConfirm();
    setTags([]);
    setStep("pick");
  }

  async function onSave() {
    if (!weather || saving) return;
    setSaving(true);
    setHasError(false);
    hideConfirm();
    const { data, error } = await submitCheckin(supabase, {
      localDate: localDateISO(),
      weather,
      tags,
    });
    setSaving(false);
    if (error || !data) {
      setHasError(true);
      return;
    }
    setSavedRow(data);
    setTags(data.tags);
    showConfirm();
  }

  const title = savedRow ? "OGGI HAI SEGNATO:" : "COM'È IL TEMPO DENTRO OGGI?";
  const showTagsStep = step === "tags" && weather !== null;

  return (
    <section>
      <SectionLabel>{title}</SectionLabel>
      <div className="glass-card p-4">
        {savedRow && loaded ? (
          <p className="mb-3 text-sm text-cream/70">
            Puoi cambiarlo se il tempo è girato.
          </p>
        ) : null}

        <div className="flex flex-wrap justify-start gap-2">
          {MOODS.map((m) => {
            const active = weather === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onPickWeather(m.key)}
                aria-pressed={active}
                className={
                  "rounded-full px-4 py-2 text-sm transition-colors " +
                  (active
                    ? "border text-cream"
                    : "border border-cream/20 bg-cream/[0.06] text-cream/85 hover:bg-cream/10")
                }
                style={
                  active
                    ? {
                        borderColor: "#5DCAA5",
                        boxShadow:
                          "0 0 0 1px #5DCAA5, 0 0 0 4px rgba(93,202,165,0.12)",
                        background: "rgba(245,239,227,0.06)",
                      }
                    : undefined
                }
              >
                {m.label}
              </button>
            );
          })}
        </div>

        <div
          className={
            "grid transition-all duration-300 ease-out motion-reduce:transition-none " +
            (showTagsStep
              ? "mt-4 grid-rows-[1fr] opacity-100 translate-y-0"
              : "mt-0 grid-rows-[0fr] opacity-0 -translate-y-1 pointer-events-none")
          }
          aria-hidden={!showTagsStep}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.9px] text-cream/[0.72]">
                COSA PESA DI PIÙ OGGI? (SE TI VA)
              </p>
              <button
                type="button"
                onClick={skipTags}
                className="shrink-0 text-xs font-medium text-mint hover:underline"
              >
                salta
              </button>
            </div>
            <div className="flex flex-wrap justify-start gap-2">
              {orderedTags.map((t) => {
                const active = tags.includes(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => toggleTag(t.key)}
                    aria-pressed={active}
                    className={
                      "rounded-full px-3.5 py-1.5 text-sm transition-colors " +
                      (active
                        ? "border text-cream"
                        : "border border-cream/20 bg-cream/[0.06] text-cream/85 hover:bg-cream/10")
                    }
                    style={
                      active
                        ? {
                            borderColor: "#5DCAA5",
                            boxShadow:
                              "0 0 0 1px #5DCAA5, 0 0 0 4px rgba(93,202,165,0.12)",
                            background: "rgba(245,239,227,0.06)",
                          }
                        : undefined
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {hasError ? (
          <div
            className="mt-4 rounded-xl px-3 py-2 text-sm"
            style={{ background: "#D4EDE5", color: "#04342C" }}
            role="status"
          >
            Non è partito il salvataggio. I tuoi contenuti sono al sicuro, riprova.
          </div>
        ) : null}

        <div className="mt-5 flex flex-col items-end gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={!weather || saving}
            className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-petrolio transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            style={{ background: "#F5EFE3" }}
          >
            {saving ? "Salvando…" : "Salva"}
          </button>
          {confirm !== "hidden" ? (
            <p
              role="status"
              className={
                "text-sm text-mint transition-opacity duration-500 ease-out motion-reduce:transition-none " +
                (confirm === "in" ? "opacity-100" : "opacity-0")
              }
            >
              Segnato. Grazie di esserti fermato un momento.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
