type Props = {
  children: React.ReactNode;
};

export default function SectionLabel({ children }: Props) {
  return (
    <p className="mb-[9px] text-xs font-semibold uppercase tracking-[0.9px] text-cream/[0.72]">
      {children}
    </p>
  );
}
