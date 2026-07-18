import Link from "next/link";

export default function AtRiskBanner() {
  return (
    <aside
      className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 text-[15px] leading-relaxed text-petrolio"
      role="note"
    >
      <p>
        Quello che hai scritto conta, e non devi restare da solo con questo. Se
        te la senti, qui c&apos;è chi risponde subito.
      </p>
      <Link
        href="/aiuto"
        className="mt-2 inline-block text-sm font-medium text-petrolio underline underline-offset-2 hover:text-petrolio/80"
      >
        Vedi i numeri di aiuto
      </Link>
    </aside>
  );
}
