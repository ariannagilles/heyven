import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Candidatura inviata — Heyven",
};

export default function CandidaturaInviataPage() {
  return (
    <>
      <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-16 pt-28 text-center">
        <h1 className="font-display text-[28px] leading-tight text-cream">
          Grazie.
        </h1>
        <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-cream">
          Non capita a molti di mettere la propria esperienza al servizio di
          qualcun altro. La leggiamo con cura, e ti facciamo sapere.
        </p>
        <Link
          href="/"
          className="btn-outline mt-8 px-8 py-3 text-[15px]"
        >
          Torna alla home
        </Link>
      </main>
    </>
  );
}
