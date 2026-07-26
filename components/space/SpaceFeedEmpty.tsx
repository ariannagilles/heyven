import Link from "next/link";
import {
  type SpaceFeedFilter,
  writeHrefForFilter,
} from "@/lib/space-feed";

type Props = {
  spaceSlug: string;
  filter: SpaceFeedFilter;
};

export default function SpaceFeedEmpty({ spaceSlug, filter }: Props) {
  return (
    <div className="glass-card px-5 py-10 text-center">
      <p className="text-[14px] leading-relaxed text-cream/60">
        Qui è ancora tutto tranquillo. Se ti va di rompere il silenzio, siamo qui.
      </p>
      <Link
        href={writeHrefForFilter(spaceSlug, filter)}
        className="btn-primary mt-5 inline-flex"
      >
        Scrivi qualcosa
      </Link>
    </div>
  );
}
