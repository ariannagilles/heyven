import { avatarDataUri } from "@/lib/avatar";

type Props = {
  nickname: string;
  size?: number;
};

export default function MentorMeetingAvatar({ nickname, size = 76 }: Props) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded-[26px] border border-cream/15 p-0.5"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(145deg, #1D9E75 0%, #0B3F34 100%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarDataUri(nickname)}
        alt=""
        width={size - 4}
        height={size - 4}
        className="h-full w-full rounded-[22px] object-cover"
        aria-hidden
      />
    </div>
  );
}
