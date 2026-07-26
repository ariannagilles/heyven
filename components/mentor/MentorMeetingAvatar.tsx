import { avatarDataUri } from "@/lib/avatar";

type Props = {
  nickname: string;
  size?: number;
};

export default function MentorMeetingAvatar({ nickname, size = 76 }: Props) {
  const outerRadius = Math.round(size * (26 / 76));
  const innerRadius = Math.max(outerRadius - 4, 6);

  return (
    <div
      className="shrink-0 overflow-hidden border border-cream/15 p-0.5"
      style={{
        width: size,
        height: size,
        borderRadius: outerRadius,
        background: "linear-gradient(145deg, #1D9E75 0%, #0B3F34 100%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarDataUri(nickname)}
        alt=""
        width={size - 4}
        height={size - 4}
        className="h-full w-full object-cover"
        style={{ borderRadius: innerRadius }}
        aria-hidden
      />
    </div>
  );
}
