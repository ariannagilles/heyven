"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { detectAtRisk } from "@/lib/at-risk";
import { recordActiveEngagement } from "@/lib/active-engagement";
import { SPACE_BY_SLUG, SPACES } from "@/lib/spaces";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type WriteFormat,
} from "@/lib/write-draft";

const SF_MAX = 500;
const DOM_MAX = 500;
const TITLE_MAX = 200;

const FORMATS: { id: WriteFormat; label: string }[] = [
  { id: "sfogo", label: "Sfogo" },
  { id: "domanda", label: "Domanda" },
  { id: "storia", label: "Storia" },
];

const SENTENCE_STARTERS = [
  "Oggi mi sento…",
  "Non riesco a dire a nessuno che…",
  "È normale che…",
];

type Props = {
  initialSpace: string;
  initialFormat: WriteFormat;
};

export default function WriteScreen({ initialSpace, initialFormat }: Props) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [format, setFormat] = useState<WriteFormat>(initialFormat);
  const [space, setSpace] = useState(initialSpace);
  const [content, setContent] = useState("");
  const [title] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  const spaceName = space ? SPACE_BY_SLUG[space]?.name : null;
  const maxLength = format === "storia" ? undefined : SF_MAX;
  const hasDraftText = content.trim().length > 0;

  const restoreDraft = useCallback(
    (spaceSlug: string, nextFormat: WriteFormat) => {
      const draft = loadDraft(spaceSlug, nextFormat);
      setContent(draft?.content ?? "");
      setDraftReady(true);
    },
    [],
  );

  useEffect(() => {
    restoreDraft(space, format);
  }, [space, format, restoreDraft]);

  useEffect(() => {
    if (!draftReady) return;
    saveDraft(space, format, { content, title });
  }, [content, title, space, format, draftReady]);

  function insertStarter(text: string) {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => (prev.length === 0 ? text : prev + text));
      return;
    }

    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + text + content.slice(end);
    setContent(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function changeFormat(next: WriteFormat) {
    if (next === format) return;
    saveDraft(space, format, { content, title });
    setFormat(next);
    setError(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    const trimmedTitle = title.trim();

    if (!space) return setError("Scegli uno spazio tematico.");
    if (trimmed.length === 0) {
      return setError(
        format === "domanda"
          ? "Scrivi la tua domanda."
          : format === "storia"
            ? "Scrivi la tua storia."
            : "Scrivi qualcosa prima di pubblicare.",
      );
    }

    if (format !== "storia" && trimmed.length > SF_MAX) {
      return setError(`Massimo ${SF_MAX} caratteri.`);
    }
    if (format === "storia" && trimmedTitle.length > TITLE_MAX) {
      return setError(`Il titolo deve essere al massimo ${TITLE_MAX} caratteri.`);
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

    if (format === "sfogo") {
      const { data, error: insErr } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          space_slug: space,
          content: trimmed,
          at_risk: detectAtRisk(trimmed),
        })
        .select("id")
        .single();

      setLoading(false);

      if (insErr || !data) {
        setError(insErr?.message ?? "Qualcosa non ha funzionato. Riprova.");
        return;
      }

      clearDraft(space, format);
      recordActiveEngagement();
      router.push(`/post/${data.id}`);
      return;
    }

    if (format === "domanda") {
      const { data, error: insErr } = await supabase
        .from("questions")
        .insert({
          author_id: user.id,
          space_slug: space,
          content: trimmed,
          at_risk: detectAtRisk(trimmed),
        })
        .select("id")
        .single();

      setLoading(false);

      if (insErr || !data) {
        setError(insErr?.message ?? "Qualcosa non ha funzionato. Riprova.");
        return;
      }

      clearDraft(space, format);
      recordActiveEngagement();
      router.replace(`/spazi/${space}/domande/${data.id}`);
      router.refresh();
      return;
    }

    const { error: insErr } = await supabase.from("stories").insert({
      author_id: user.id,
      space_slug: space,
      title: trimmedTitle || null,
      content: trimmed,
      at_risk: detectAtRisk(trimmedTitle, trimmed),
    });

    setLoading(false);

    if (insErr) {
      setError(insErr.message);
      return;
    }

    clearDraft(space, format);
    recordActiveEngagement();
    router.replace(`/spazi/${space}/storie`);
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 bg-petrolio/80 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Chiudi"
            className="glass-card flex h-[34px] w-[34px] shrink-0 items-center justify-center text-sm leading-none text-cream/80 transition-transform active:scale-[0.98]"
          >
            ✕
          </button>
          <h1 className="font-display text-[17px] leading-tight text-cream">
            Butta fuori
          </h1>
        </div>
      </header>

      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4"
      >
        <div className="flex-1 space-y-4 pb-36">
          <div className="glass-card rounded-[22px] p-1">
            <div className="grid grid-cols-3 gap-1" role="tablist" aria-label="Formato">
              {FORMATS.map((item) => {
                const active = item.id === format;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => changeFormat(item.id)}
                    className={
                      "rounded-[18px] px-2 py-2.5 text-sm font-medium transition active:scale-[0.98] " +
                      (active
                        ? "bg-cream text-petrolio"
                        : "text-cream/55 hover:text-cream/75")
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {spaceName ? (
            <p className="text-[12.5px] text-cream/55">
              In › <span className="text-mint">{spaceName}</span>
            </p>
          ) : (
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] text-cream/55">
                Scegli uno spazio
              </span>
              <select
                value={space}
                onChange={(e) => setSpace(e.target.value)}
                className="glass-card w-full appearance-none rounded-[16px] border-0 bg-transparent px-3 py-2.5 text-sm text-cream outline-none"
              >
                <option value="" className="bg-petrolio text-cream">
                  Seleziona…
                </option>
                {SPACES.map((s) => (
                  <option key={s.slug} value={s.slug} className="bg-petrolio text-cream">
                    {s.emoji} {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="glass-card min-h-[150px] p-4">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Scrivi quello che senti. Non deve essere perfetto."
              maxLength={maxLength}
              required
              rows={6}
              className="min-h-[118px] w-full resize-none border-0 bg-transparent text-[15px] leading-[1.6] text-cream outline-none placeholder:text-cream/25"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {SENTENCE_STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => insertStarter(starter)}
                className="rounded-full border border-cream/10 bg-cream/5 px-3 py-1.5 text-xs text-cream/75 transition-transform active:scale-[0.98] hover:bg-cream/10"
              >
                {starter}
              </button>
            ))}
          </div>

          {hasDraftText && (
            <p className="text-[11.5px] text-mint/60">
              ● Bozza salvata — non la perdi
            </p>
          )}

          {error && <p className="msg-error">{error}</p>}
        </div>

        <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-4">
          <div className="mx-auto max-w-2xl">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-cream py-3.5 text-[15px] font-semibold text-petrolio transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Pubblico…" : "Pubblica in anonimo"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
