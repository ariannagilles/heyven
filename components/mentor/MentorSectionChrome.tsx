"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";

function navigateBack(router: ReturnType<typeof useRouter>) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

const MENTOR_HEADER_CONTENT_GAP_PX = 12;

/** Extra fade below the gap so the hero meets the chrome without a hard line. */
const MENTOR_HEADER_FADE_BELOW_GAP_PX = 14;

/** Fallback until the fixed header is measured in the DOM (SSR / first paint). */
const MENTOR_HEADER_SPACER_FALLBACK = `calc(env(safe-area-inset-top) + 56px + ${MENTOR_HEADER_CONTENT_GAP_PX}px)`;

const headerSoftEdgeMask: CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, black calc(100% - 10px), transparent 100%)",
  maskImage:
    "linear-gradient(to bottom, black 0%, black calc(100% - 10px), transparent 100%)",
};

export default function MentorSectionChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeightPx, setHeaderHeightPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const measure = () => {
      setHeaderHeightPx(el.getBoundingClientRect().height);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const spacerHeight =
    headerHeightPx != null
      ? headerHeightPx + MENTOR_HEADER_CONTENT_GAP_PX
      : MENTOR_HEADER_SPACER_FALLBACK;

  const fadeStripHeight =
    MENTOR_HEADER_CONTENT_GAP_PX + MENTOR_HEADER_FADE_BELOW_GAP_PX;

  return (
    <>
      <div
        ref={headerRef}
        style={headerSoftEdgeMask}
        className="pointer-events-none fixed left-0 right-0 top-0 z-40 border-0 bg-[rgba(4,52,44,0.28)] pt-[env(safe-area-inset-top)] backdrop-blur-md"
      >
        <div className="pointer-events-auto mx-auto grid max-w-5xl grid-cols-[44px_1fr_44px] items-center px-2 py-1.5">
          <button
            type="button"
            onClick={() => navigateBack(router)}
            aria-label="Torna indietro"
            className="inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center self-center rounded-xl text-xl leading-none text-cream transition-colors duration-300 ease-out hover:bg-cream/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2b25] motion-reduce:transition-none"
          >
            ←
          </button>
          <div className="flex justify-center px-1">
            <img
              src="/logo-white.png"
              alt="heyven"
              width={112}
              height={42}
              className="h-auto w-16 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] md:w-20"
            />
          </div>
        </div>
      </div>

      {headerHeightPx != null ? (
        <div
          aria-hidden
          className="pointer-events-none fixed left-0 right-0 z-[39] border-0 bg-gradient-to-b from-[rgba(4,52,44,0.26)] via-[rgba(4,52,44,0.12)] to-transparent backdrop-blur-[2px]"
          style={{
            top: headerHeightPx,
            height: fadeStripHeight,
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 100%)",
          }}
        />
      ) : null}

      <div
        aria-hidden
        className="shrink-0 bg-transparent"
        style={{
          height:
            typeof spacerHeight === "number" ? `${spacerHeight}px` : spacerHeight,
        }}
      />

      {children}

      <div className="pt-6 pb-4 text-center">
        <button
          type="button"
          onClick={() => navigateBack(router)}
          className="text-[14px] leading-[1.6] text-cream/60 transition-colors duration-300 ease-out hover:text-cream/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2b25] motion-reduce:transition-none"
        >
          ← Torna indietro
        </button>
      </div>
    </>
  );
}
