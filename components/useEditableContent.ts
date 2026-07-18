"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { detectAtRisk } from "@/lib/at-risk";
import {
  updateStoryContent,
  updateTextContent,
  type TextContentTable,
} from "@/lib/content-edit";

export type EditableContentTable = TextContentTable | "stories";

type Options = {
  table: EditableContentTable;
  id: string;
  authorId: string;
  viewerId: string | null;
  initialContent: string;
  initialTitle?: string | null;
  initialUpdatedAt: string | null;
  contentMaxLength?: number;
};

export function useEditableContent(options: Options) {
  const router = useRouter();
  const canEdit = Boolean(options.viewerId && options.viewerId === options.authorId);

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(options.initialContent);
  const [title, setTitle] = useState(options.initialTitle ?? "");
  const [updatedAt, setUpdatedAt] = useState(options.initialUpdatedAt);
  const [draftContent, setDraftContent] = useState(options.initialContent);
  const [draftTitle, setDraftTitle] = useState(options.initialTitle ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = useCallback(() => {
    setDraftContent(content);
    setDraftTitle(title);
    setError(null);
    setEditing(true);
  }, [content, title]);

  const cancelEdit = useCallback(() => {
    setDraftContent(content);
    setDraftTitle(title);
    setError(null);
    setEditing(false);
  }, [content, title]);

  const saveEdit = useCallback(async () => {
    const trimmed = draftContent.trim();
    if (!trimmed) {
      setError("Il contenuto non può essere vuoto.");
      return;
    }
    if (
      options.contentMaxLength != null &&
      trimmed.length > options.contentMaxLength
    ) {
      setError(`Massimo ${options.contentMaxLength} caratteri.`);
      return;
    }

    const trimmedTitle = draftTitle.trim();
    if (options.table === "stories" && trimmedTitle.length > 200) {
      setError("Il titolo deve essere al massimo 200 caratteri.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    const result =
      options.table === "stories"
        ? await updateStoryContent(supabase, options.id, {
            content: trimmed,
            title: trimmedTitle || null,
            at_risk: detectAtRisk(trimmedTitle, trimmed),
          })
        : await updateTextContent(supabase, options.table, options.id, {
            content: trimmed,
            at_risk: detectAtRisk(trimmed),
          });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setContent(trimmed);
    setTitle(trimmedTitle);
    setUpdatedAt(result.updatedAt);
    setEditing(false);
    router.refresh();
  }, [draftContent, draftTitle, options]);

  return {
    canEdit,
    editing,
    content,
    title,
    updatedAt,
    draftContent,
    draftTitle,
    setDraftContent,
    setDraftTitle,
    loading,
    error,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}
