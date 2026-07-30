"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchMentorApplicationEligibility } from "@/lib/mentor-application";

export default function MentorApplicationProfileRow() {
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    fetchMentorApplicationEligibility(supabase).then((result) => {
      if (result) {
        setVisible(result.visible);
        setPending(result.pending);
      }
      setLoaded(true);
    });
  }, []);

  if (!loaded || (!visible && !pending)) {
    return null;
  }

  if (pending) {
    return (
      <>
        <div className="mx-4 border-t border-cream/10" aria-hidden />
        <div className="flex items-center gap-3 px-4 py-3.5 text-[15px] leading-snug text-cream/60">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream/5 text-cream/45"
            aria-hidden
          >
            <IconHeart />
          </span>
          <span className="min-w-0 flex-1">
            La tua candidatura come Mentore è in lettura.
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-4 border-t border-cream/10" aria-hidden />
      <Link
        href="/diventa-mentore"
        className="flex items-center gap-3 px-4 py-3.5 text-cream transition-colors hover:bg-cream/[0.04] active:bg-cream/[0.06]"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream/5 text-cream/75"
          aria-hidden
        >
          <IconHeart />
        </span>
        <span className="min-w-0 flex-1 text-[15px] leading-snug">
          Vuoi esserci per qualcun altro?
        </span>
        <span className="shrink-0 text-lg leading-none text-cream/35" aria-hidden>
          ›
        </span>
      </Link>
    </>
  );
}

function IconHeart() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-7-4.35-7-10a4 4 0 0 1 7-2.5 4 4 0 0 1 7 2.5c0 5.65-7 10-7 10Z" />
    </svg>
  );
}
