"use client";

import { usePathname } from "next/navigation";
import UrgentHelpLink from "./UrgentHelpLink";

export default function UrgentHelpBar() {
  const pathname = usePathname() ?? "";
  if (pathname === "/aiuto" || pathname.startsWith("/aiuto/")) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-30 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2"
      aria-label="Aiuto urgente"
    >
      <UrgentHelpLink className="inline-block text-sm bg-crema/90 backdrop-blur px-3 py-1.5 rounded-full border border-petrolio/10 shadow-soft" />
    </div>
  );
}
