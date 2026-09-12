import { Suspense } from "react";
import { headers } from "next/headers";
import Navbar, { NavbarSkeleton } from "@/components/Navbar";

const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/reset-password",
  "/auth",
  "/new",
  "/chat",
  "/diventa-mentore",
];

function shouldShowNavbar(pathname: string) {
  return !HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export default function AppNavbar() {
  const pathname = headers().get("x-heyven-path") ?? "";
  if (!shouldShowNavbar(pathname)) return null;

  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <Navbar />
    </Suspense>
  );
}
