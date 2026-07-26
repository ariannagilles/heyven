"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidatePathAction } from "@/lib/revalidate-path";
import { recordActiveEngagement } from "@/lib/active-engagement";

type Props =
  | {
      kind: "sfogo";
      postId: string;
      initialCount: number;
      initialActive: boolean;
    }
  | {
      kind: "storia";
      storyId: string;
      initialCount: number;
      initialActive: boolean;
    }
  | {
      kind: "domanda";
    };

function VisualPill({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex flex-1 items-center justify-center rounded-full bg-cream/5 px-2 py-2.5 text-xs font-medium text-cream/70 transition-transform active:scale-[0.98]"
    >
      {label}
    </button>
  );
}

function ActivePill({
  label,
  active,
  onClick,
  busy,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={active}
      className={
        "flex flex-1 items-center justify-center rounded-full px-2 py-2.5 text-xs font-medium transition-transform active:scale-[0.98] disabled:opacity-50 " +
        (active
          ? "bg-mint/15 text-mint"
          : "bg-cream/5 text-cream/70")
      }
    >
      {label}
    </button>
  );
}

export default function ReactionBar(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [visualPressed, setVisualPressed] = useState<string | null>(null);

  const [count, setCount] = useState(
    props.kind === "domanda" ? 0 : props.initialCount,
  );
  const [active, setActive] = useState(
    props.kind === "domanda" ? false : props.initialActive,
  );
  const [busy, setBusy] = useState(false);

  async function toggleAnchio() {
    if (props.kind === "domanda" || busy) return;

    setBusy(true);
    const wasActive = active;
    setActive(!wasActive);
    setCount((c) => c + (wasActive ? -1 : 1));

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setActive(wasActive);
      setCount((c) => c + (wasActive ? 1 : -1));
      setBusy(false);
      return;
    }

    if (props.kind === "sfogo") {
      if (wasActive) {
        const { error } = await supabase
          .from("me_too")
          .delete()
          .eq("post_id", props.postId)
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
          .insert({ post_id: props.postId, user_id: user.id });
        if (error) {
          setActive(false);
          setCount((c) => c - 1);
        } else {
          recordActiveEngagement();
          await revalidatePathAction(pathname);
          startTransition(() => router.refresh());
        }
      }
    } else {
      if (wasActive) {
        const { error } = await supabase
          .from("story_reactions")
          .delete()
          .eq("story_id", props.storyId)
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
          .from("story_reactions")
          .insert({ story_id: props.storyId, user_id: user.id });
        if (error) {
          setActive(false);
          setCount((c) => c - 1);
        } else {
          recordActiveEngagement();
          await revalidatePathAction(pathname);
          startTransition(() => router.refresh());
        }
      }
    }

    setBusy(false);
  }

  const anchioLabel =
    props.kind === "domanda"
      ? "❤ Anch'io"
      : `❤ Anch'io${count > 0 ? ` · ${count}` : ""}`;

  return (
    <div className="glass-card flex gap-2 rounded-[26px] p-2">
      {props.kind === "domanda" ? (
        <VisualPill label="❤ Anch'io" />
      ) : (
        <ActivePill
          label={anchioLabel}
          active={active}
          onClick={toggleAnchio}
          busy={busy}
        />
      )}
      <VisualPill
        label="Ti abbraccio"
        onPress={() => setVisualPressed("abbraccio")}
      />
      <VisualPill label="Ti leggo" onPress={() => setVisualPressed("leggo")} />
      <span className="sr-only" aria-live="polite">
        {visualPressed ? `${visualPressed} registrato visivamente` : ""}
      </span>
    </div>
  );
}
