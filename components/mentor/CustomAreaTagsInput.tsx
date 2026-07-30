"use client";

import { KeyboardEvent, useState } from "react";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  hasError?: boolean;
};

const TAG_CLASS =
  "inline-flex max-w-full items-center gap-1 rounded-full border border-[rgba(245,239,227,0.28)] bg-[rgba(245,239,227,0.06)] px-2.5 py-1 text-[13px] leading-snug text-cream/[0.85]";

function fieldErrorClass(hasError: boolean) {
  return hasError
    ? "border-mint/60 shadow-[0_0_0_1px_rgba(93,202,165,0.5),0_0_0_4px_rgba(93,202,165,0.12)]"
    : "";
}

export default function CustomAreaTagsInput({ tags, onChange, hasError = false }: Props) {
  const [input, setInput] = useState("");

  function addFromInput(raw: string) {
    const trimmed = raw.trim().replace(/,+$/, "").trim();
    if (!trimmed) {
      setInput("");
      return;
    }
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFromInput(input);
      return;
    }
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div>
      <label className="field-label" htmlFor="customAreaTags">
        Aiutaci a capire meglio
      </label>
      <div
        className={`field-input mt-2 flex min-h-[52px] flex-wrap items-center gap-2 py-2 ${fieldErrorClass(hasError)}`}
      >
        {tags.map((tag) => (
          <span key={tag} className={TAG_CLASS}>
            <span className="truncate">{tag}</span>
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="shrink-0 text-cream/55 transition-colors hover:text-cream/85"
              aria-label={`Rimuovi ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="customAreaTags"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (input.trim()) addFromInput(input);
          }}
          className="min-w-[6rem] flex-1 border-0 bg-transparent p-0 text-[16px] text-cream outline-none"
        />
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-cream/60">
        Scrivi e premi invio o virgola per aggiungere.
      </p>
    </div>
  );
}
