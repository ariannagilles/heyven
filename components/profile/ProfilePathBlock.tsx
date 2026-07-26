import SectionLabel from "@/components/SectionLabel";
import ProfilePathWave from "./ProfilePathWave";

type Props = {
  /** Optional weekly intention — shown in mint, never as a deadline task. */
  smallStep?: string | null;
  /** Optional check-in mood series for an evocative wave (no labels or scores). */
  checkInPoints?: number[] | null;
};

export default function ProfilePathBlock({
  smallStep = null,
  checkInPoints = null,
}: Props) {
  return (
    <section>
      <SectionLabel>Il tuo percorso</SectionLabel>
      <div className="glass-card p-4">
        <ProfilePathWave points={checkInPoints} />
        <p className="mt-3 text-[14px] leading-[1.55] text-cream/70">
          {smallStep ? (
            <>
              Guarda quanta strada.{" "}
              <span className="text-mint">{smallStep}</span>
            </>
          ) : (
            "Ogni passo conta, anche quando non lo vedi subito."
          )}
        </p>
      </div>
    </section>
  );
}
