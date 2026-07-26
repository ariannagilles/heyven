import Link from "next/link";

export default function AtRiskBanner() {
  return (
    <aside
      className="mb-4 rounded-[18px] border px-4 py-3 text-[13px] leading-[1.5] text-[#EAC77A]"
      style={{
        backgroundColor: "rgba(234, 199, 122, 0.12)",
        borderColor: "rgba(234, 199, 122, 0.32)",
      }}
      role="note"
    >
      <p className="font-semibold">☾ Quello che scrivi conta.</p>
      <p className="mt-1">
        Se in questo momento fai davvero fatica, non sei solo. C&apos;è qualcuno pronto
        ad ascoltarti, anche solo per stanotte.
      </p>
      <Link
        href="/aiuto"
        className="mt-2 inline-block underline underline-offset-2 hover:text-amber"
      >
        Serve aiuto adesso ›
      </Link>
    </aside>
  );
}
