type Props = {
  nickname: string;
  size?: number;
  className?: string;
};

export default function Avatar({ nickname, size = 40, className = "" }: Props) {
  const seed = encodeURIComponent(nickname || "anon");
  const url = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      width={size}
      height={size}
      alt={`avatar di ${nickname}`}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size }}
      className={`rounded-full bg-petrolio/10 shrink-0 ${className}`}
    />
  );
}
