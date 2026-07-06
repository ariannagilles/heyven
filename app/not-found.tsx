import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
      <h1 className="text-xl font-semibold">Pagina non trovata</h1>
      <p className="text-sm text-petrolio/70">
        La pagina che cerchi non esiste o è stata spostata.
      </p>
      <Link href="/" className="btn-primary inline-flex">
        Torna alla home
      </Link>
    </main>
  );
}
