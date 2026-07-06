import Link from "next/link";
import Navbar from "@/components/Navbar";
import NewPostForm from "./NewPostForm";
import { SPACE_BY_SLUG } from "@/lib/spaces";

export const dynamic = "force-dynamic";

export default function NewSfogoPage({
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
          <h1 className="text-xl font-semibold">🌊 Sfogati</h1>
          <p className="text-sm text-petrolio/70 mt-1">
            Pubblichi in anonimo. Solo il tuo nickname sarà visibile.
          </p>
        </div>
        <NewPostForm initialSpace={initialSpace} />
      </main>
    </>
  );
}
