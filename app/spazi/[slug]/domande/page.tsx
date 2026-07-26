import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DomandeTabRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/spazi/${params.slug}?tipo=domanda`);
}
