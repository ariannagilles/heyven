import Link from "next/link";

export default function AtRiskBanner() {
  return (
    <aside
      className="mb-3 rounded-lg border border-amber-200/50 bg-amber-50/[0.08] px-3 py-2 text-xs leading-relaxed text-petrolio/75"
      role="note"
    >
      <p>Hai scritto qualcosa di importante. Qui c&apos;è chi può ascoltarti.</p>
      <Link
        href="/chat"
        className="mt-1 inline-block text-xs font-medium text-petrolio/65 underline underline-offset-2 hover:text-petrolio transition"
      >
        Parlane con un Mentore
      </Link>
    </aside>
  );
}
