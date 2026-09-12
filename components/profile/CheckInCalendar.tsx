"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  localDateISO,
  moodByKey,
  tagByKey,
  type MoodKey,
  type MoodTagKey,
} from "@/lib/moods";
import { getCheckinHistory } from "@/lib/check-in-rpc";
import { createClient } from "@/lib/supabase/client";

const CELLS = 35;

type Cell = {
  date: Date;
  iso: string;
  weather: MoodKey | null;
  tags: MoodTagKey[];
};

function shiftDays(d: Date, delta: number): Date {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  next.setDate(next.getDate() + delta);
  return next;
}

function buildCells(history: Map<string, { weather: MoodKey; tags: MoodTagKey[] }>): Cell[] {
  const today = new Date();
  const cells: Cell[] = [];
  for (let i = CELLS - 1; i >= 0; i--) {
    const date = shiftDays(today, -i);
    const iso = localDateISO(date);
    const entry = history.get(iso);
    cells.push({
      date,
      iso,
      weather: entry?.weather ?? null,
      tags: entry?.tags ?? [],
    });
  }
  return cells;
}

function last7SummarySentence(cells: Cell[]): string {
  const last7 = cells.slice(-7);
  const filled = last7.filter((c) => c.weather !== null).length;
  if (filled >= 5) return "Questa settimana ci sei stato quasi ogni giorno.";
  if (filled >= 1) return "Ci sei passato di qui. Va bene anche così.";
  return "Il tuo meteo è ancora tutto da scrivere.";
}

function formatDateItalian(date: Date): string {
  const formatted = date.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return formatted.replace(/\.$/g, "").replace(/\.,/g, ",");
}

export default function CheckInCalendar() {
  const supabase = useMemo(() => createClient(), []);
  const [cells, setCells] = useState<Cell[] | null>(null);
  const [selected, setSelected] = useState<Cell | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await getCheckinHistory(supabase, CELLS);
      if (cancelled) return;
      const map = new Map<string, { weather: MoodKey; tags: MoodTagKey[] }>();
      for (const row of data) {
        map.set(row.local_date, { weather: row.weather, tags: row.tags });
      }
      setCells(buildCells(map));
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const sentence = cells ? last7SummarySentence(cells) : "";

  return (
    <div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
        role="list"
        aria-label="Ultimi 35 giorni"
      >
        {(cells ?? Array.from({ length: CELLS }, () => null)).map((cell, i) => {
          if (!cell) {
            return (
              <div
                key={i}
                className="aspect-square rounded-full"
                style={{ background: "rgba(245,239,227,0.08)" }}
                aria-hidden
              />
            );
          }
          const mood = cell.weather ? moodByKey(cell.weather) : null;
          const filled = mood !== null;
          return (
            <button
              key={cell.iso}
              type="button"
              role="listitem"
              onClick={filled ? () => setSelected(cell) : undefined}
              disabled={!filled}
              aria-label={
                filled
                  ? `${formatDateItalian(cell.date)}, ${mood!.label}`
                  : formatDateItalian(cell.date)
              }
              className={
                "aspect-square rounded-full transition-transform " +
                (filled ? "active:scale-95 cursor-pointer" : "cursor-default")
              }
              style={{
                background: filled ? mood!.color : "rgba(245,239,227,0.18)",
                boxShadow: filled
                  ? "inset 0 1px 0 rgba(255,255,255,0.15)"
                  : undefined,
              }}
            />
          );
        })}
      </div>

      {cells ? (
        <p className="mt-4 text-[14px] leading-[1.55] text-cream/70">
          {sentence}
        </p>
      ) : null}

      {selected ? (
        <CheckInSheet cell={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function CheckInSheet({ cell, onClose }: { cell: Cell; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const mood = cell.weather ? moodByKey(cell.weather) : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: "rgba(4,52,44,0.55)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-card mx-3 mb-3 w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.9px] text-cream/[0.72]">
          {formatDateItalian(cell.date)}
        </p>

        {mood ? (
          <div className="mt-3 flex items-center gap-3">
            <span
              className="inline-block h-3.5 w-3.5 rounded-full"
              style={{
                background: mood.color,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
              aria-hidden
            />
            <span className="text-[17px] text-cream">{mood.label}</span>
          </div>
        ) : null}

        {cell.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {cell.tags.map((k) => {
              const t = tagByKey(k);
              return (
                <span
                  key={k}
                  className="inline-flex items-center rounded-full border border-cream/20 bg-cream/[0.06] px-3 py-1 text-[13px] text-cream/85"
                >
                  {t?.label ?? k}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-cream/60">
            Nessun tag per questo giorno.
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-mint hover:underline"
          >
            chiudi
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

