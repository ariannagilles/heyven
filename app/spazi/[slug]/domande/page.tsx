import Link from "next/link";
import { redirect } from "next/navigation";
import Avatar from "@/components/Avatar";
import QuestionForm from "./QuestionForm";
import { createClient } from "@/lib/supabase/server";
import { getQuestions } from "@/lib/space-content";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function DomandeTab({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}/domande`);

  const questions = await getQuestions(supabase, params.slug);

  return (
    <div className="space-y-4">
      <QuestionForm spaceSlug={params.slug} />

      {questions.length === 0 ? (
        <div className="card p-8 text-center text-petrolio/70">
          Nessuna domanda. Sii la prima persona a chiedere.
        </div>
      ) : (
        <ul className="space-y-3">
          {questions.map((q) => (
            <li key={q.id} className="card p-4">
              <header className="flex items-center gap-2 text-xs text-petrolio/60 mb-2">
                <Avatar nickname={q.nickname} size={28} />
                <span className="font-medium text-petrolio">@{q.nickname}</span>
                <span aria-hidden>·</span>
                <time dateTime={q.created_at}>{timeAgo(q.created_at)}</time>
              </header>
              <p className="text-petrolio leading-relaxed whitespace-pre-wrap">
                {q.content}
              </p>
              <footer className="mt-3 flex items-center justify-between gap-2">
                <span className="text-sm text-petrolio/70">
                  {q.reply_count} rispost{q.reply_count === 1 ? "a" : "e"}
                </span>
                <Link
                  href={`/spazi/${params.slug}/domande/${q.id}`}
                  className="btn-outline text-sm"
                >
                  Rispondi
                </Link>
              </footer>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
