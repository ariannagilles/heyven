"use client";

import type { FormEvent, ReactNode } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string | null;
  maxLength: number;
  children?: ReactNode;
};

export default function ReplyComposer({
  value,
  onChange,
  onSubmit,
  loading,
  error,
  maxLength,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="glass-card flex items-end gap-2 rounded-3xl p-3"
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">Scrivi una risposta</span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Scrivi una risposta…"
          maxLength={maxLength}
          rows={2}
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-cream placeholder:text-cream/40 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={loading || value.trim().length === 0}
        aria-label="Invia risposta"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal text-cream transition-transform hover:bg-teal-mid active:scale-[0.98] disabled:opacity-50"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
      {error && <p className="sr-only">{error}</p>}
    </form>
  );
}
