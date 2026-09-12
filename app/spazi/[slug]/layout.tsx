import { notFound } from "next/navigation";
import { SPACE_BY_SLUG } from "@/lib/spaces";

export default function SpaceLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: React.ReactNode;
}) {
  const space = SPACE_BY_SLUG[params.slug];
  if (!space) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">{children}</main>
  );
}
