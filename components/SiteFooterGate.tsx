"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";

export default function SiteFooterGate() {
  const pathname = usePathname() ?? "";

  if (
    pathname === "/diventa-mentore" ||
    pathname.startsWith("/diventa-mentore/")
  ) {
    return null;
  }

  return <SiteFooter />;
}
