"use client";

import { useMemo, useState } from "react";
import CustomAreaTagsInput from "@/components/mentor/CustomAreaTagsInput";
import { createClient } from "@/lib/supabase/client";

const EXPERIENCE_AREAS = [
  { label: "Ansia", slug: "ansia" },
  { label: "Depressione", slug: "depressione" },
  { label: "Disturbi alimentari", slug: "dca" },
  { label: "Burnout", slug: "burnout" },
  { label: "Relazioni difficili", slug: "relazioni" },
  { label: "Solitudine", slug: "solitudine" },
  { label: "Lutto", slug: "lutto" },
  { label: "Identità", slug: "identita" },
  { label: "Altro", slug: "altro" },
] as const;

const OFFICIAL_SLUGS = new Set<string>(
  EXPERIENCE_AREAS.filter((a) => a.slug !== "altro").map((a) => a.slug),
);

const MAX = 4;

const CHIP_ACTIVE =
  "border-mint bg-mint/10 text-cream";
const CHIP_INACTIVE =
  "border-[rgba(245,239,227,0.28)] bg-[rgba(245,239,227,0.06)] text-cream/[0.85] hover:bg-[rgba(245,239,227,0.09)]";

const MENTOR_AREA_TAG_PILL_CLASS =
  `inline-flex max-w-full items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm leading-snug ${CHIP_ACTIVE}`;

function experienceSelectionCount(slugs: string[], tags: string[]) {
  return slugs.filter((s) => s !== "altro").length + tags.length;
}

function chipClass(active: boolean) {
  return `rounded-full border px-3.5 py-2 text-sm leading-snug transition-colors duration-200 ease-out motion-reduce:transition-none ${
    active ? CHIP_ACTIVE : CHIP_INACTIVE
  }`;
}

function partitionInitial(initial: string[]) {
  const official: string[] = [];
  const legacyOrCustom: string[] = [];
  for (const slug of initial) {
    if (OFFICIAL_SLUGS.has(slug)) {
      if (!official.includes(slug)) official.push(slug);
    } else if (slug !== "altro") {
      legacyOrCustom.push(slug);
    }
  }
  return { official, legacyOrCustom };
}

export default function ExperienceAreasEditor({ initial }: { initial: string[] }) {
  const partitioned = useMemo(() => partitionInitial(initial), [initial]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() => {
    const slugs = [...partitioned.official];
    if (partitioned.legacyOrCustom.length > 0) {
      slugs.push("altro");
    }
    return slugs;
  });
  const [customTags, setCustomTags] = useState<string[]>(() => partitioned.legacyOrCustom);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalSelected = experienceSelectionCount(selectedSlugs, customTags);
  const selectionAtMax = totalSelected >= MAX;
  const altroActive = selectedSlugs.includes("altro");

  function toggleArea(slug: string) {
    setSavedMsg(null);
    setError(null);

    setSelectedSlugs((prev) => {
      let slugs = [...prev];
      const count = experienceSelectionCount(slugs, customTags);

      if (slugs.includes(slug)) {
        slugs = slugs.filter((s) => s !== slug);
      } else {
        if (slug !== "altro" && count >= MAX) {
          setError(`Puoi scegliere al massimo ${MAX} aree.`);
          return prev;
        }
        slugs.push(slug);
      }

      if (!slugs.includes("altro")) {
        setCustomTags([]);
      }

      return slugs;
    });
  }

  function onCustomTagsChange(nextTags: string[]) {
    const prevCount = experienceSelectionCount(selectedSlugs, customTags);
    const nextCount = experienceSelectionCount(selectedSlugs, nextTags);
    if (nextCount > prevCount && nextCount > MAX) {
      setError(`Puoi scegliere al massimo ${MAX} aree.`);
      return;
    }
    setError(null);
    setSavedMsg(null);
    setCustomTags(nextTags);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSavedMsg(null);

    if (altroActive && customTags.length === 0) {
      setSaving(false);
      setError("Aggiungi almeno un tag oppure deseleziona Altro.");
      return;
    }

    const areasToSave = selectedSlugs.filter(
      (s) => s !== "altro" && OFFICIAL_SLUGS.has(s),
    );

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("set_mentor_experience_areas", {
      areas: areasToSave,
    });
    setSaving(false);

    if (rpcError) {
      setError("Non è stato possibile salvare. Riprova.");
      return;
    }

    setSavedMsg("Aree aggiornate.");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {EXPERIENCE_AREAS.map(({ label, slug }) => {
          const active = selectedSlugs.includes(slug);
          const chipDisabled =
            !active && slug !== "altro" && selectionAtMax;
          return (
            <button
              key={slug}
              type="button"
              disabled={chipDisabled}
              onClick={() => toggleArea(slug)}
              className={`${chipClass(active)} ${
                chipDisabled ? "cursor-not-allowed opacity-40" : "active:scale-[0.98]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {altroActive && (
        <CustomAreaTagsInput
          inputId="mentorSettingsCustomAreaTags"
          showLabel={false}
          tags={customTags}
          tagPillClassName={MENTOR_AREA_TAG_PILL_CLASS}
          inputDisabled={selectionAtMax}
          inputHint="Scrivi e premi invio o virgola per aggiungere."
          disabledHint={`Hai raggiunto il massimo di ${MAX}.`}
          footerHint="Questi tag non attivano subito il matching: li leggiamo e, se ha senso, diventano un'area ufficiale. Nel frattempo restano visibili solo a te."
          onChange={onCustomTagsChange}
        />
      )}

      {error && (
        <p className="rounded-xl bg-[#D4EDE5] px-3 py-2 text-sm text-[#04342C]">{error}</p>
      )}
      {savedMsg && (
        <p className="rounded-xl bg-[#D4EDE5] px-3 py-2 text-sm text-[#04342C]">{savedMsg}</p>
      )}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="btn-primary text-sm"
      >
        {saving ? "Salvataggio…" : "Salva le aree"}
      </button>
    </div>
  );
}
