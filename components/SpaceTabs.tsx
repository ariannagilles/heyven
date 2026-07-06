"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SpaceTabs({ slug }: { slug: string }) {
  const path = usePathname() ?? "";
  const base = `/spazi/${slug}`;
  const tabs = [
    { href: base, label: "Sfoghi" },
    { href: `${base}/domande`, label: "Domande" },
    { href: `${base}/storie`, label: "Storie" },
  ];

  return (
    <nav className="flex items-center gap-1 border-b border-petrolio/10 -mx-4 px-4">
      {tabs.map((t) => {
        const active =
          t.href === base
            ? path === base
            : path === t.href || path.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={
              "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition " +
              (active
                ? "border-petrolio text-petrolio"
                : "border-transparent text-petrolio/60 hover:text-petrolio")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
