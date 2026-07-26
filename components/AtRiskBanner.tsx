import Link from "next/link";

export default function AtRiskBanner() {
  return (
    <aside
      className="mb-3 rounded-lg border border-amber/25 bg-amber/10 px-3 py-2 text-xs leading-relaxed text-cream/75"
      role="note"
    >
      <p>Hai scritto qualcosa di importante. Qui c&apos;è chi può ascoltarti.</p>
      <Link
        href="/chat"
        className="mt-1 inline-block text-xs font-medium text-cream/65 underline underline-offset-2 hover:text-cream transition"
      >
        Parlane con un Mentore
      </Link>
    </aside>
  );
}
