"use client";

import { FormEvent, useState } from "react";

export default function CityMap() {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState<string | null>(null);

  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = city.trim();
    if (!trimmed) return;
    setQuery(trimmed);
  }

  const embedSrc = query
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        `psicologo ${query}`,
      )}&output=embed`
    : null;

  return (
    <div className="space-y-3">
      <form onSubmit={search} className="card p-3 flex items-center gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Inserisci la tua città..."
          className="field flex-1"
          aria-label="Città"
        />
        <button
          type="submit"
          disabled={city.trim().length === 0}
          className="btn-primary shrink-0"
        >
          Cerca
        </button>
      </form>

      {embedSrc ? (
        <div className="rounded-3xl overflow-hidden border border-petrolio/10 bg-white">
          <iframe
            src={embedSrc}
            title={`Psicologi a ${query}`}
            className="w-full h-[360px] sm:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="card p-8 text-center text-petrolio/60">
          La mappa appare qui dopo la ricerca.
        </div>
      )}
    </div>
  );
}
