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
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Spazi</h1>
          <p className="text-sm text-petrolio/70">
            Scegli uno spazio per leggere, chiedere o raccontare.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SPACES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/spazi/${s.slug}`}
                className="card block p-5 hover:bg-white transition"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl shrink-0 leading-none" aria-hidden>
                    {s.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="font-semibold text-petrolio">{s.name}</h2>
                      <span className="text-xs text-petrolio/50 tabular-nums">
                        {counts.get(s.slug) ?? 0} post
                      </span>
                    </div>
                    <p className="text-sm text-petrolio/70 mt-1">
                      {s.description}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
