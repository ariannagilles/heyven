import SectionLabel from "@/components/SectionLabel";
import CheckInCalendar from "./CheckInCalendar";

export default function ProfilePathBlock() {
  return (
    <section>
      <SectionLabel>Il tuo percorso</SectionLabel>
      <div className="glass-card p-4">
        <CheckInCalendar />
      </div>
    </section>
  );
}
