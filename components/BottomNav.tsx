"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const items: {
  href: string;
  label: string;
  icon: string;
  center?: boolean;
}[] = [
  { href: "/", label: "Casa", icon: "home" },
  { href: "/spazi", label: "Spazi", icon: "spaces" },
  { href: "/new", label: "Scrivi", icon: "write", center: true },
  { href: "/chat", label: "Mentore", icon: "mentor" },
  { href: "/profilo", label: "Tu", icon: "profile" },
];

export default function BottomNav() {
  const pathname = usePathname() ?? "";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hiddenPrefixes = ["/login", "/register", "/reset-password", "/admin"];
  if (
    !isLoggedIn ||
    hiddenPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return null;
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#04342C]/10 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = isActive(item.href);
          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#04342C] text-[#FAEEDA] shadow-lg shadow-[#04342C]/25 transition-transform active:scale-95"
              >
                <IconWrite />
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-colors ${
                active ? "text-[#04342C]" : "text-[#7A9188]"
              }`}
            >
              <Icon name={item.icon} active={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Icon({ name, active }: { name: string; active: boolean }) {
  const className = active ? "text-[#04342C]" : "text-[#7A9188]";

  switch (name) {
    case "home":
      return (
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden
        >
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case "spaces":
      return (
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden
        >
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "mentor":
      return (
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden
        >
          <path d="M5 6.5a3.5 3.5 0 0 1 3.5-3.5h7A3.5 3.5 0 0 1 19 6.5v6A3.5 3.5 0 0 1 15.5 16H11l-3.5 3v-3H8.5A3.5 3.5 0 0 1 5 12.5v-6Z" />
          <path d="M9 8.5h6M9 11.5h4" />
        </svg>
      );
    case "profile":
      return (
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden
        >
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 19.5c1.4-3 4.1-4.5 6.5-4.5s5.1 1.5 6.5 4.5" />
        </svg>
      );
    default:
      return null;
  }
}

function IconWrite() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h7" />
      <path d="M15.5 5.5 18.5 8.5 8 19l-4 1 1-4 10.5-10.5Z" />
    </svg>
  );
}
