import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NewStoriaRedirect({
  searchParams,
}: {
  searchParams: { space?: string };
}) {
  const params = new URLSearchParams({ tipo: "storia" });
  if (searchParams.space) params.set("space", searchParams.space);
  redirect(`/new?${params.toString()}`);
}
