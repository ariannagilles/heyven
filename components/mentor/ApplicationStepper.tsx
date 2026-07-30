type Props = {
  step: 1 | 2 | 3 | 4;
};

export default function ApplicationStepper({ step }: Props) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
      {[1, 2, 3, 4].map((segment) => (
        <div
          key={segment}
          className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ease-out motion-reduce:transition-none ${
            segment <= step ? "bg-mint" : "bg-cream/[0.16]"
          }`}
        />
      ))}
    </div>
  );
}
