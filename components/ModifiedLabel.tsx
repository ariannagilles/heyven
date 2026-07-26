import { formatShortDate } from "@/lib/time";

type Props = {
  editedAt: string;
};

export default function ModifiedLabel({ editedAt }: Props) {
  return (
    <span className="text-cream/40">
      Modificato · {formatShortDate(editedAt)}
    </span>
  );
}
