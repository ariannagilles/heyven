"use client";

import { FormEvent } from "react";

type Props = {
  contentLabel: string;
  content: string;
  onContentChange: (value: string) => void;
  contentMaxLength?: number;
  title?: string;
  onTitleChange?: (value: string) => void;
  titleMaxLength?: number;
  showTitle?: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  onCancel: () => void;
  textareaClassName?: string;
  showReplyWarning?: boolean;
};

export default function ContentEditForm({
  contentLabel,
  content,
  onContentChange,
  contentMaxLength,
  title = "",
  onTitleChange,
  titleMaxLength = 200,
  showTitle = false,
  loading,
  error,
  onSubmit,
  onCancel,
  textareaClassName = "min-h-[160px]",
  showReplyWarning = false,
}: Props) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showTitle && onTitleChange && (
        <label className="block">
          <span className="text-xs font-medium text-cream/70">Titolo</span>
          <input
            className="field mt-1"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Dai un titolo alla tua storia (opzionale)"
            maxLength={titleMaxLength}
          />
        </label>
      )}

      {showReplyWarning && (
        <p className="text-sm text-cream/60 leading-relaxed">
          Ci sono già delle risposte qui sotto. Le piccole modifiche vanno bene — se
          invece vuoi dire una cosa completamente diversa, forse è meglio scrivere un
          nuovo contenuto.
        </p>
      )}

      <label className="block">
        <span className="text-xs font-medium text-cream/70">{contentLabel}</span>
        <textarea
          className={`field mt-1 ${textareaClassName}`}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          maxLength={contentMaxLength}
          required
        />
        {contentMaxLength != null && (
          <div className="mt-1 text-right text-xs text-cream/50 tabular-nums">
            {content.length} / {contentMaxLength}
          </div>
        )}
      </label>

      {error && (
        <p className="msg-error">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="btn-outline text-sm"
          onClick={onCancel}
          disabled={loading}
        >
          Annulla
        </button>
        <button type="submit" className="btn-primary text-sm" disabled={loading}>
          {loading ? "Salvo…" : "Salva"}
        </button>
      </div>
    </form>
  );
}
