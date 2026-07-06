import { redirect } from "next/navigation";
import PostCard from "@/components/PostCard";
import { createClient } from "@/lib/supabase/server";
import { fetchFeed } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function PostTab({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/spazi/${params.slug}`);

  const posts = await fetchFeed(supabase, user.id, { spaceSlug: params.slug });

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="card p-8 text-center text-petrolio/70">
          Nessun post in questo spazio.
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.id}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
