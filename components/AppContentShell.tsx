"use client";

import { usePathname } from "next/navigation";
import SiteFooterGate from "@/components/SiteFooterGate";

function isDiventaMentorePath(pathname: string) {
  return (
    pathname === "/diventa-mentore" ||
    pathname.startsWith("/diventa-mentore/")
  );
}

export default function AppContentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const mentorSection = isDiventaMentorePath(pathname);

  return (
    <div className={mentorSection ? "pb-0" : "pb-28"}>
      {children}
      <SiteFooterGate />
    </div>
  );
}
