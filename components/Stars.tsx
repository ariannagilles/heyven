type Props = {
  value: number;
  size?: "sm" | "md" | "lg";
  label?: string;
};

export default function Stars({ value, size = "md", label }: Props) {
  const sizeCls =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  const filled = Math.round(value);
  return (
    <div
      className={`flex items-center gap-0.5 leading-none ${sizeCls}`}
      aria-label={label ?? `${value} stelle su 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= filled ? "text-petrolio" : "text-petrolio/20"}>
          ★
        </span>
      ))}
    </div>
  );
}
