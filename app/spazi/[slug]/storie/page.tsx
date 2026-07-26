import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function StorieTabRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/spazi/${params.slug}?tipo=storia`);
}
