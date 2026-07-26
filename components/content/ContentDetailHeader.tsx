import Link from "next/link";

export type ContentKind = "sfogo" | "domanda" | "storia";

export function contentDetailTitle(kind: ContentKind, isAuthor: boolean): string {
  if (isAuthor) {
    if (kind === "sfogo") return "Il tuo sfogo";
    if (kind === "domanda") return "La tua domanda";
    return "La tua storia";
  }
  if (kind === "sfogo") return "Sfogo";
  if (kind === "domanda") return "Domanda";
  return "Storia";
}

type HeaderProps = {
  backHref: string;
  title: string;
};

export default function ContentDetailHeader({ backHref, title }: HeaderProps) {
  return (
    <header className="mb-5 flex items-center gap-3">
      <Link
        href={backHref}
        aria-label="Torna indietro"
        className="glass-card flex h-[34px] w-[34px] shrink-0 items-center justify-center text-lg leading-none text-cream/80 transition-transform active:scale-[0.98]"
      >
        ‹
      </Link>
      <h1 className="font-display text-[16px] leading-tight text-cream">{title}</h1>
    </header>
  );
}
