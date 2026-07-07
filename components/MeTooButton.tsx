"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidatePathAction } from "@/lib/revalidate-path";

type Props = {
  postId: string;
  initialCount: number;
  initialActive: boolean;
};

export default function MeTooButton({ postId, initialCount, initialActive }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(initialActive);
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

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
        .from("me_too")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      if (error) {
        setActive(true);
        setCount((c) => c + 1);
      } else {
        await revalidatePathAction(pathname);
        startTransition(() => router.refresh());
      }
    } else {
      const { error } = await supabase
        .from("me_too")
        .insert({ post_id: postId, user_id: user.id });
      if (error) {
        setActive(false);
        setCount((c) => c - 1);
      } else {
        await revalidatePathAction(pathname);
        startTransition(() => router.refresh());
      }
    }

    setBusy(false);
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
      <span>anch'io</span>
      <span className="tabular-nums opacity-80">{count}</span>
    </button>
  );
}
