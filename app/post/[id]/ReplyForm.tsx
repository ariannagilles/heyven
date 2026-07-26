"use client";

import { FormEvent, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import ReplyComposer from "@/components/content/ReplyComposer";
import { createClient } from "@/lib/supabase/client";
import { revalidatePathAction } from "@/lib/revalidate-path";
import { recordActiveEngagement } from "@/lib/active-engagement";

const MAX = 2000;

export default function ReplyForm({ postId }: { postId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (trimmed.length === 0) return setError("Scrivi qualcosa prima di rispondere.");
    if (trimmed.length > MAX) return setError(`Massimo ${MAX} caratteri.`);

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const { error: insErr } = await supabase
      .from("replies")
      .insert({ post_id: postId, author_id: user.id, content: trimmed });

    setLoading(false);

    if (insErr) {
      setError(insErr.message);
      return;
    }
    setContent("");
    recordActiveEngagement();
    await revalidatePathAction(pathname);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-2">
      <ReplyComposer
        value={content}
        onChange={setContent}
        onSubmit={onSubmit}
        loading={loading}
        error={error}
        maxLength={MAX}
      />
      {error && <p className="msg-error px-1">{error}</p>}
    </div>
  );
}
