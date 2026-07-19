import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { avatarDataUri } from "@/lib/avatar";
import { getProfile } from "@/lib/chat";
import { getUnreadNotificationsCount } from "@/lib/notifications";
import NavbarProfileMenu from "./NavbarProfileMenu";

export default async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let nickname: string | null = null;
  let unreadNotifications = 0;

  if (user) {
    const profile = await getProfile(supabase, user.id);
    nickname = profile?.nickname ?? null;
    unreadNotifications = await getUnreadNotificationsCount(supabase);
  }

  return (
    <header className="sticky top-0 z-20 bg-crema/85 backdrop-blur border-b border-petrolio/10">
      <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="font-semibold tracking-tight text-petrolio text-lg shrink-0"
        >
          heyven
        </Link>

        {user ? (
          <nav className="flex items-center gap-1">
            <Link
              href="/notifiche"
              aria-label="Notifiche"
              title="Notifiche"
              className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm bg-petrolio/5 text-petrolio hover:bg-petrolio/10"
            >
              <BellIcon />
              <span className="hidden sm:inline">notifiche</span>
              <CountBadge count={unreadNotifications} label="notifiche non lette" />
            </Link>

            <Link
              href="/vai-oltre"
              aria-label="Vai oltre"
              title="Vai oltre"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm bg-petrolio/5 text-petrolio hover:bg-petrolio/10"
            >
              <StepIcon />
              <span className="hidden sm:inline">vai oltre</span>
            </Link>

            {nickname && (
              <NavbarProfileMenu
                nickname={nickname}
                avatarSrc={avatarDataUri(nickname)}
              />
            )}
          </nav>
        ) : (
          <Link href="/login" className="btn-primary text-sm">
            Entra
          </Link>
        )}
      </div>
    </header>
  );
}

function CountBadge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  const text = count > 99 ? "99+" : String(count);
  return (
    <span
      aria-label={`${count} ${label}`}
      className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center rounded-full bg-[#FAC775] text-[10px] font-semibold text-[#04342C] leading-none ring-2 ring-crema tabular-nums"
    >
      {text}
    </span>
  );
}

function BellIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function StepIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
    >
      <path d="M5 12h13" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
