import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import MarkReportReviewedButton from "../MarkReportReviewedButton";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/chat";
import {
  enrichPendingReports,
  TARGET_TYPE_LABELS,
  type PendingReport,
  type ReportTargetType,
} from "@/lib/reports";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

function isReportTargetType(v: string): v is ReportTargetType {
  return v in TARGET_TYPE_LABELS;
}

export default async function AdminReportsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/reports");

  const profile = await getProfile(supabase, user.id);
  if (profile?.role !== "admin") redirect("/");

  const { data, error } = await supabase
    .from("reports")
    .select("id, reporter_id, target_type, target_id, reason, created_at")
    .eq("reviewed", false)
    .order("created_at", { ascending: false })
    .limit(200);

  const raw = ((data ?? []) as PendingReport[]).filter((r) =>
    isReportTargetType(r.target_type),
  );
  const reports = await enrichPendingReports(supabase, raw);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <header className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold">Segnalazioni contenuti</h1>
              <p className="text-sm text-petrolio/70 mt-1">
                {reports.length} in attesa di revisione
              </p>
            </div>
            <Link href="/admin" className="btn-outline text-sm shrink-0">
              ← Dashboard
            </Link>
          </div>
        </header>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
            {error.message}
          </p>
        )}

        {reports.length === 0 ? (
          <div className="card p-8 text-center text-petrolio/70">
            Nessuna segnalazione in attesa.
          </div>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <header className="flex items-center gap-2 flex-wrap text-xs text-petrolio/60 mb-2">
                      <span className="font-medium text-petrolio">
                        {TARGET_TYPE_LABELS[r.target_type]}
                      </span>
                      <span aria-hidden>·</span>
                      <time dateTime={r.created_at}>{timeAgo(r.created_at)}</time>
                    </header>

                    {r.reason ? (
                      <p className="text-petrolio leading-relaxed whitespace-pre-wrap">
                        {r.reason}
                      </p>
                    ) : (
                      <p className="text-sm text-petrolio/50 italic">Nessun motivo indicato</p>
                    )}

                    {r.contentUrl ? (
                      <Link
                        href={r.contentUrl}
                        className="inline-block mt-2 text-sm text-petrolio/70 hover:text-petrolio underline underline-offset-2"
                      >
                        Vedi contenuto originale →
                      </Link>
                    ) : (
                      <p className="mt-2 text-xs text-petrolio/50 font-mono break-all">
                        ID: {r.target_id}
                      </p>
                    )}
                  </div>
                  <MarkReportReviewedButton reportId={r.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
