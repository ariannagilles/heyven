import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { SPACES } from "@/lib/spaces";

export const dynamic = "force-dynamic";

export default async function SpacesListPage() {
  const supabase = createClient();
  const { data } = await supabase.from("posts").select("space_slug");

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { space_slug: string }[]) {
    counts.set(row.space_slug, (counts.get(row.space_slug) ?? 0) + 1);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
        <header className="mb-5">
          <h1 className="font-display text-2xl leading-tight text-cream">Gli spazi</h1>
          <p className="mt-1 text-[13.5px] text-cream/70">
            Entra dove ti senti a casa oggi.
          </p>
        </header>

        <ul className="grid grid-cols-2 gap-[11px]">
          {SPACES.map((s) => {
            const count = counts.get(s.slug) ?? 0;
            return (
              <li key={s.slug}>
                <Link
                  href={`/spazi/${s.slug}`}
                  className="glass-card flex min-h-[104px] flex-col p-[15px] transition-transform active:scale-[0.98]"
                >
                  <span className="text-[26px] leading-none" aria-hidden>
                    {s.emoji}
                  </span>
                  <h2 className="mt-2 text-[14px] font-medium leading-tight text-cream">
                    {s.name}
                  </h2>
                  <p className="mt-1 text-[11.5px] text-cream/60 tabular-nums">
                    {count} oggi
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
