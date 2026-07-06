import Link from "next/link";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

const CARDS = [
  {
    href: "/new/sfogo",
    emoji: "🌊",
    title: "Sfogati",
    text: "Hai qualcosa sul cuore adesso? Scrivilo, anche se non sai come spiegarlo.",
  },
  {
    href: "/new/domanda",
    emoji: "❓",
    title: "Fai una domanda",
    text: "Hai un dubbio? Vuoi sapere se altri l'hanno vissuto? Chiedi alla community.",
  },
  {
    href: "/new/storia",
    emoji: "📖",
    title: "Racconta una storia",
    text: "Hai attraversato qualcosa e vuoi condividerlo? La tua storia può aiutare chi ci sta passando adesso.",
  },
];

export default function NewPickerPage({
  searchParams,
}: {
  searchParams: { space?: string };
}) {
  const suffix = searchParams.space ? `?space=${searchParams.space}` : "";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <h1 className="text-xl font-semibold">Cosa vuoi condividere?</h1>
        <ul className="space-y-3">
          {CARDS.map((c) => (
            <li key={c.href}>
              <Link
                href={`${c.href}${suffix}`}
                className="card block p-5 hover:bg-white transition"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl shrink-0 leading-none" aria-hidden>
                    {c.emoji}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-petrolio">{c.title}</h2>
                    <p className="text-sm text-petrolio/70 mt-1 leading-relaxed">
                      {c.text}
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
