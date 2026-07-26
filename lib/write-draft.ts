export type WriteFormat = "sfogo" | "domanda" | "storia";

export type WriteDraft = {
  content: string;
  title?: string;
};

export function draftStorageKey(spaceSlug: string, format: WriteFormat): string {
  const space = spaceSlug || "none";
  return `heyven_draft_${space}_${format}`;
}

export function loadDraft(spaceSlug: string, format: WriteFormat): WriteDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftStorageKey(spaceSlug, format));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WriteDraft;
    if (typeof parsed.content !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(
  spaceSlug: string,
  format: WriteFormat,
  draft: WriteDraft,
): void {
  if (typeof window === "undefined") return;
  const trimmed = draft.content.trim();
  if (trimmed.length === 0) {
    clearDraft(spaceSlug, format);
    return;
  }
  localStorage.setItem(draftStorageKey(spaceSlug, format), JSON.stringify(draft));
}

export function clearDraft(spaceSlug: string, format: WriteFormat): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(draftStorageKey(spaceSlug, format));
}

export function parseWriteFormat(value: string | undefined): WriteFormat {
  if (value === "domanda") return "domanda";
  if (value === "storia") return "storia";
  return "sfogo";
}
