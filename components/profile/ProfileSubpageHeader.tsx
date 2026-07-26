"use client";

import { useRouter } from "next/navigation";

type Props = {
  title: string;
};

export default function ProfileSubpageHeader({ title }: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.push("/profilo")}
        aria-label="Torna al profilo"
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
