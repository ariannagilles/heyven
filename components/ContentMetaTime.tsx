import ModifiedLabel from "@/components/ModifiedLabel";
import { timeAgo } from "@/lib/time";

type Props = {
  createdAt: string;
  editedAt: string | null;
};

export default function ContentMetaTime({ createdAt, editedAt }: Props) {
  return (
    <>
      <time dateTime={createdAt}>{timeAgo(createdAt)}</time>
      {editedAt && (
        <>
          <span aria-hidden>·</span>
          <ModifiedLabel editedAt={editedAt} />
        </>
      )}
    </>
  );
}
