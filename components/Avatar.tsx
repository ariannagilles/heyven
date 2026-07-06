import { avatarDataUri } from "@/lib/avatar";
import { AvatarImage } from "./AvatarImage";

type Props = {
  nickname: string;
  size?: number;
  className?: string;
};

export default function Avatar({ nickname, size = 40, className = "" }: Props) {
  return (
    <AvatarImage
      src={avatarDataUri(nickname)}
      nickname={nickname}
      size={size}
      className={className}
    />
  );
}
