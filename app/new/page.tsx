import WriteScreen from "@/components/write/WriteScreen";
import { SPACE_BY_SLUG } from "@/lib/spaces";
import { parseWriteFormat } from "@/lib/write-draft";

export const dynamic = "force-dynamic";

export default function NewWritePage({
  searchParams,
}: {
  searchParams: { space?: string; tipo?: string };
}) {
  const initialSpace = SPACE_BY_SLUG[searchParams.space ?? ""]?.slug ?? "";
  const initialFormat = parseWriteFormat(searchParams.tipo);

  return <WriteScreen initialSpace={initialSpace} initialFormat={initialFormat} />;
}
