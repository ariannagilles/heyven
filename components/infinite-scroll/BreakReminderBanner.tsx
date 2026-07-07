"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onActiveEngagement } from "@/lib/active-engagement";

const BREAK_REMINDER_MS = 20 * 60 * 1000;

export default function BreakReminderBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    let timer = window.setTimeout(() => setVisible(true), BREAK_REMINDER_MS);

    const resetTimer = () => {
      window.clearTimeout(timer);
      setVisible(false);
      timer = window.setTimeout(() => setVisible(true), BREAK_REMINDER_MS);
    };

    const unsubscribe = onActiveEngagement(resetTimer);

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [dismissed]);

  if (!visible || dismissed) return null;

  const dismiss = () => setDismissed(true);

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-2xl"
    >
      <div className="card relative border-petrolio/20 bg-white/95 p-4 pt-5 shadow-soft backdrop-blur-sm">
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 rounded-full p-1 text-petrolio/50 hover:bg-petrolio/5 hover:text-petrolio"
          aria-label="Chiudi"
        >
          <span aria-hidden>✕</span>
        </button>

        <p className="pr-8 text-sm text-petrolio leading-relaxed">
          Hai letto molto oggi. Vuoi fare una pausa?
        </p>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="btn-outline flex-1 text-sm"
          >
            Sto bene, continuo
          </button>
          <Link
            href="/"
            className="btn flex-1 text-sm bg-petrolio/10 text-petrolio hover:bg-petrolio/15"
          >
            Fai una pausa
          </Link>
        </div>
      </div>
    </div>
  );
}
