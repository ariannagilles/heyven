import Link from "next/link";

const LINKS = [
  { href: "/aiuto", label: "Aiuto urgente" },
  { href: "/diventa-mentore", label: "Diventa Mentore" },
  { href: "/vai-oltre", label: "Vai oltre" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="mx-auto max-w-2xl px-4 py-8 pb-4">
      <nav
        aria-label="Link utili"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-cream/55"
      >
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-cream/75"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
