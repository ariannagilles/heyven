import ModifiedLabel from "@/components/ModifiedLabel";
import { timeAgo } from "@/lib/time";

type Props = {
  createdAt: string;
  updatedAt: string | null;
};

export default function ContentMetaTime({ createdAt, updatedAt }: Props) {
  return (
    <>
      <time dateTime={createdAt}>{timeAgo(createdAt)}</time>
      {updatedAt && (
        <>
          <span aria-hidden>·</span>
          <ModifiedLabel />
        </>
      )}
    </>
  );
}
