import Avatar from "@/components/Avatar";

const MONTHS = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

function joinedMonthLabel(iso: string | null): string {
  if (!iso) return "poco fa";
  const d = new Date(iso);
  return MONTHS[d.getMonth()] ?? "—";
}

type Props = {
  nickname: string;
  joinedAt: string | null;
};

export default function ProfileHubHeader({ nickname, joinedAt }: Props) {
  const month = joinedMonthLabel(joinedAt);

  return (
    <header className="flex flex-col items-center px-2 pt-2 text-center">
      <div
        className="overflow-hidden border border-cream/15 p-0.5"
        style={{ width: 74, height: 74, borderRadius: 26 }}
      >
        <Avatar
          nickname={nickname}
          size={70}
          className="!rounded-[22px]"
        />
      </div>
      <h1 className="font-display mt-3 text-[21px] leading-tight text-cream">
        @{nickname}
      </h1>
      <p className="mt-1.5 text-[12px] leading-snug text-cream/45">
        Solo tu sai chi c&apos;è dietro · da {month}
      </p>
    </header>
  );
}
