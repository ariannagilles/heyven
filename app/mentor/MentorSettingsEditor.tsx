"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CAP_OPTIONS = [1, 2, 3, 4, 5] as const;

export default function MentorSettingsEditor({
  initialMaxActiveConversations,
  initialIsAvailable,
}: {
  initialMaxActiveConversations: number;
  initialIsAvailable: boolean;
}) {
  const router = useRouter();
  const [maxActiveConversations, setMaxActiveConversations] = useState(
    initialMaxActiveConversations
  );
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable);
  const [savedMaxActiveConversations, setSavedMaxActiveConversations] = useState(
    initialMaxActiveConversations
  );
  const [savedIsAvailable, setSavedIsAvailable] = useState(initialIsAvailable);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMaxActiveConversations(initialMaxActiveConversations);
    setIsAvailable(initialIsAvailable);
    setSavedMaxActiveConversations(initialMaxActiveConversations);
    setSavedIsAvailable(initialIsAvailable);
  }, [initialMaxActiveConversations, initialIsAvailable]);

  const dirty =
    maxActiveConversations !== savedMaxActiveConversations ||
    isAvailable !== savedIsAvailable;

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(t);
  }, [saved]);

  async function save() {
    setError(null);
    setSaved(false);
    setSaving(true);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("update_mentor_settings", {
      p_max_active_conversations: maxActiveConversations,
      p_is_available: isAvailable,
    });
    setSaving(false);

    if (rpcError || data?.ok === false) {
      setError("Non siamo riusciti a salvare. Riprova.");
      return;
    }

    if (data?.ok === true) {
      setSavedMaxActiveConversations(maxActiveConversations);
      setSavedIsAvailable(isAvailable);
      setSaved(true);
      router.refresh();
    } else {
      setError("Non siamo riusciti a salvare. Riprova.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-cream">Quante persone puoi seguire insieme</p>
        <p className="text-[13px] text-cream/60">
          Il sistema non ti assegnerà nuove persone oltre questo numero.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {CAP_OPTIONS.map((n) => {
            const active = maxActiveConversations === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setMaxActiveConversations(n);
                  setError(null);
                }}
                className={
                  "inline-flex min-h-[40px] min-w-[2.5rem] flex-1 items-center justify-center rounded-full px-3 py-2 text-sm font-medium tabular-nums transition-colors sm:flex-none sm:min-w-[2.75rem] " +
                  (active
                    ? "border border-mint bg-mint/10 text-cream"
                    : "bg-[rgba(245,239,227,0.06)] text-cream/80 hover:bg-cream/[0.08]")
                }
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-cream">Disponibilità</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isAvailable}
            aria-label={
              isAvailable
                ? "Disponibile per nuove persone"
                : "In pausa, non riceverai nuovi abbinamenti"
            }
            onClick={() => {
              setIsAvailable((v) => !v);
              setError(null);
            }}
            className={
              "relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2b25] " +
              (isAvailable ? "bg-mint/45" : "bg-cream/10")
            }
          >
            <span
              className={
                "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-cream shadow-sm transition-transform " +
                (isAvailable ? "translate-x-5" : "translate-x-0")
              }
            />
          </button>
          <p className="text-sm text-cream/80">
            {isAvailable
              ? "Disponibile per nuove persone"
              : "In pausa — non riceverai nuovi abbinamenti"}
          </p>
        </div>
        <p className="text-[13px] text-cream/60">
          Puoi metterti in pausa quando vuoi, anche solo per qualche giorno. Le conversazioni già
          aperte restano attive.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="btn-primary"
        >
          {saving ? "Salvataggio..." : "Salva"}
        </button>
        {saved && <span className="text-sm text-mint">Salvato</span>}
      </div>

      {error && (
        <p className="text-sm rounded-xl bg-[#D4EDE5] px-3 py-2 text-[#04342C]">{error}</p>
      )}
    </div>
  );
}
