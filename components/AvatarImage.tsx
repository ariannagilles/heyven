type AvatarImageProps = {
  src: string;
  nickname: string;
  size?: number;
  className?: string;
};

export function AvatarImage({
  src,
  nickname,
  size = 40,
  className = "",
}: AvatarImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
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
