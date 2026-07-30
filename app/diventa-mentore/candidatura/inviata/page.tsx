import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Candidatura inviata — Heyven",
};

export default function CandidaturaInviataPage() {
  return (
    <>
      <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-2xl flex-col items-center justify-center px-4 pb-24 pt-20 text-center">
        <h1 className="font-display text-[28px] leading-tight text-cream">
          L&apos;abbiamo ricevuta.
        </h1>
        <p className="mt-4 max-w-md text-[16px] leading-[1.6] text-cream">
          La leggiamo tutta. Ti scriviamo entro due settimane, in ogni caso.
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
