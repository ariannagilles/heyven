"use client";

import { FormEvent, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import ReplyComposer from "@/components/content/ReplyComposer";
import { createClient } from "@/lib/supabase/client";
import { revalidatePathAction } from "@/lib/revalidate-path";
import { recordActiveEngagement } from "@/lib/active-engagement";

const MAX = 2000;

export default function ReplyForm({ questionId }: { questionId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX) {
      setError(`Massimo ${MAX} caratteri.`);
      return;
    }
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
      .from("question_replies")
      .insert({ question_id: questionId, author_id: user.id, content: trimmed });
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
        onSubmit={submit}
        loading={loading}
        error={error}
        maxLength={MAX}
      />
      {error && <p className="msg-error px-1">{error}</p>}
    </div>
  );
}
