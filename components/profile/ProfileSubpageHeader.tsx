"use client";

import { useRouter } from "next/navigation";
import { navigateBack } from "@/lib/navigate-back";

type Props = {
  title: string;
  fallbackHref?: string;
  backAriaLabel?: string;
};

export default function ProfileSubpageHeader({
  title,
  fallbackHref = "/profilo",
  backAriaLabel = "Torna al profilo",
}: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => navigateBack(router, fallbackHref)}
        aria-label={backAriaLabel}
        className="glass-card flex h-[34px] w-[34px] shrink-0 items-center justify-center text-lg leading-none text-cream/80 transition-transform active:scale-[0.98]"
      >
        ‹
      </button>
      <h1 className="font-display text-[20px] leading-tight text-cream">
        {title}
      </h1>
    </div>
  );
}
