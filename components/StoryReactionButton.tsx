"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  storyId: string;
  initialCount: number;
  initialActive: boolean;
};

export default function StoryReactionButton({
  storyId,
  initialCount,
  initialActive,
}: Props) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const wasActive = active;
    setActive(!wasActive);
    setCount((c) => c + (wasActive ? -1 : 1));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setActive(wasActive);
      setCount((c) => c + (wasActive ? 1 : -1));
      setBusy(false);
      return;
    }

    if (wasActive) {
      const { error } = await supabase
        .from("story_reactions")
        .delete()
        .eq("story_id", storyId)
        .eq("user_id", user.id);
      if (error) {
        setActive(true);
        setCount((c) => c + 1);
      }
    } else {
      const { error } = await supabase
        .from("story_reactions")
        .insert({ story_id: storyId, user_id: user.id });
      if (error) {
        setActive(false);
        setCount((c) => c - 1);
      }
    }

    setBusy(false);
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition " +
        (active
          ? "bg-petrolio text-crema"
          : "bg-petrolio/5 text-petrolio hover:bg-petrolio/10")
      }
    >
      <span aria-hidden>♡</span>
      <span>anch&apos;io</span>
      <span className="tabular-nums opacity-80">{count}</span>
    </button>
  );
}
