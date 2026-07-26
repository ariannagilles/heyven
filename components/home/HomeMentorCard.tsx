export default function HomeMentorCard() {
  return (
    <div className="glass-card flex items-center gap-3 p-4">
      <div
        aria-hidden
        className="h-[42px] w-[42px] shrink-0 rounded-xl"
        style={{
          background: "linear-gradient(145deg, #1D9E75 0%, #0B3F34 100%)",
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cream/60">
          Il tuo Mentore
        </p>
        <p className="text-sm text-cream">Ci sono, quando vuoi.</p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-full bg-cream px-4 py-2 text-sm font-medium text-petrolio"
      >
        Continua
      </button>
    </div>
  );
}
