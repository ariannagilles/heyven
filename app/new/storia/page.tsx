import Link from "next/link";
import Navbar from "@/components/Navbar";
import NewStoryForm from "./NewStoryForm";
import { SPACE_BY_SLUG } from "@/lib/spaces";

export const dynamic = "force-dynamic";

export default function NewStoriaPage({
  searchParams,
}: {
  searchParams: { space?: string };
}) {
  const initialSpace = SPACE_BY_SLUG[searchParams.space ?? ""]?.slug ?? "";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <Link href="/new" className="text-sm text-petrolio/60 hover:text-petrolio">
          ← indietro
        </Link>
        <div>
          <h1 className="text-xl font-semibold">📖 Racconta una storia</h1>
          <p className="text-sm text-petrolio/70 mt-1">
            Prenditi tutto lo spazio che ti serve.
          </p>
        </div>
        <NewStoryForm initialSpace={initialSpace} />
      </main>
    </>
  );
}
