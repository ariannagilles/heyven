import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SpaceTabs from "@/components/SpaceTabs";
import { SPACE_BY_SLUG } from "@/lib/spaces";

export default function SpaceLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: React.ReactNode;
}) {
  const space = SPACE_BY_SLUG[params.slug];
  if (!space) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <Link
          href="/spazi"
          className="text-sm text-petrolio/60 hover:text-petrolio"
        >
          ← tutti gli spazi
        </Link>

        <section className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="text-3xl shrink-0 leading-none" aria-hidden>
                {space.emoji}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold">{space.name}</h1>
                <p className="text-sm text-petrolio/70 mt-1">
                  {space.description}
                </p>
              </div>
            </div>
            <Link
              href={`/new?space=${params.slug}`}
              className="btn-primary shrink-0"
            >
              Scrivi
            </Link>
          </div>
        </section>

        <SpaceTabs slug={params.slug} />

        {children}
      </main>
    </>
  );
}
