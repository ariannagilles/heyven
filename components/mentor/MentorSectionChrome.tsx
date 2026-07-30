"use client";

import { useRouter } from "next/navigation";

function navigateBack(router: ReturnType<typeof useRouter>) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

export default function MentorSectionChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <>
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
        <div className="pointer-events-auto mx-auto grid h-11 max-w-5xl grid-cols-[44px_1fr_44px] items-center px-2">
          <button
            type="button"
            onClick={() => navigateBack(router)}
            aria-label="Torna indietro"
            className="inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-xl leading-none text-cream backdrop-blur-sm transition-colors duration-300 ease-out hover:bg-cream/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2b25] motion-reduce:transition-none"
          >
            ←
          </button>
          <span className="pointer-events-none text-center font-display text-[1.1rem] font-normal tracking-tight text-cream/85">
            heyven
          </span>
        </div>
      </div>

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
