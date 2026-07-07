import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import {
  getNotifications,
  markAllNotificationsRead,
  notificationHref,
  notificationText,
} from "@/lib/notifications";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function NotifichePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notifiche");

  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  await markAllNotificationsRead(supabase, user.id);

  const notifications = await getNotifications(supabase, user.id, {
    limit: PAGE_SIZE + 1,
    offset,
  });

  const hasMore = notifications.length > PAGE_SIZE;
  const items = hasMore ? notifications.slice(0, PAGE_SIZE) : notifications;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <header>
          <h1 className="text-xl font-semibold">Notifiche</h1>
          <p className="text-sm text-petrolio/60 mt-1">
            Aggiornamenti sui tuoi contenuti.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="card p-8 text-center text-petrolio/70">
            Nessuna notifica, per ora.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={notificationHref(n)}
                  className="card block p-4 hover:bg-white transition"
                >
                  <p className="text-[15px] text-petrolio leading-snug">
                    {notificationText(n)}
                  </p>
                  {n.target_preview && (
                    <p className="text-sm text-petrolio/70 mt-1.5 line-clamp-2">
                      &ldquo;{n.target_preview}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-petrolio/60 mt-1.5">
                    @{n.actor_nickname ?? "anonimo"} · {timeAgo(n.created_at)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {(page > 1 || hasMore) && (
          <nav className="flex items-center justify-between gap-3 pt-2">
            {page > 1 ? (
              <Link
                href={`/notifiche?page=${page - 1}`}
                className="text-sm text-petrolio/70 hover:text-petrolio underline underline-offset-2"
              >
                ← Più recenti
              </Link>
            ) : (
              <span />
            )}
            {hasMore && (
              <Link
                href={`/notifiche?page=${page + 1}`}
                className="text-sm text-petrolio/70 hover:text-petrolio underline underline-offset-2"
              >
                Più vecchie →
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
