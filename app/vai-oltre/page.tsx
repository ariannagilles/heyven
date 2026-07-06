import Navbar from "@/components/Navbar";
import CityMap from "./CityMap";

export const dynamic = "force-dynamic";

export default function VaiOltrePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">Vai oltre</h1>
          <p className="text-sm text-petrolio/70 mt-2 leading-relaxed">
            Heyven è il posto dove hai iniziato. Quando senti di voler fare un
            passo in più, siamo qui per aiutarti.
          </p>
        </header>

        {/* ONLINE */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Parla con uno psicologo online
            </h2>
            <p className="text-sm text-petrolio/70 mt-1">
              Sessioni con professionisti qualificati, da casa tua, ai tuoi
              tempi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PartnerCard
              letter="S"
              name="Serenis"
              description="Psicoterapeuti selezionati, prima sessione gratuita."
            />
            <PartnerCard
              letter="U"
              name="Unobravo"
              description="Oltre 9.000 professionisti, matching personalizzato."
            />
          </div>
        </section>

        {/* OFFLINE */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Trova uno psicologo vicino a te
            </h2>
            <p className="text-sm text-petrolio/70 mt-1">
              Inserisci la tua città per trovare professionisti nella tua zona.
            </p>
          </div>

          <CityMap />

          <p className="text-xs text-petrolio/50 leading-relaxed">
            I professionisti mostrati sono risultati pubblici di Google Maps.
            Heyven non ha rapporti commerciali con questi professionisti.
          </p>
        </section>

        {/* EMERGENCY */}
        <section className="rounded-3xl bg-petrolio-900 text-crema p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Hai bisogno di aiuto immediato?
            </h2>
            <p className="text-sm text-crema/80 mt-1 leading-relaxed">
              Heyven non è un servizio di emergenza. Se sei in crisi chiama:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EmergencyCard
              label="Telefono Amico"
              number="02 2327 2327"
              href="tel:0223272327"
            />
            <EmergencyCard
              label="Numero di emergenza"
              number="112"
              href="tel:112"
            />
          </div>
        </section>
      </main>
    </>
  );
}

function PartnerCard({
  letter,
  name,
  description,
}: {
  letter: string;
  name: string;
  description: string;
}) {
  return (
    <article className="card p-5 flex flex-col">
      <header className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-petrolio text-crema flex items-center justify-center text-xl font-semibold shrink-0">
          {letter}
        </div>
        <h3 className="font-semibold text-petrolio">{name}</h3>
      </header>
      <p className="text-sm text-petrolio/80 leading-relaxed flex-1">
        {description}
      </p>
      <button
        type="button"
        disabled
        className="btn mt-4 bg-petrolio/10 text-petrolio/60 cursor-not-allowed"
      >
        Prossimamente
      </button>
      <p className="text-xs text-petrolio/50 mt-2">
        Stiamo lavorando a una convenzione per te.
      </p>
    </article>
  );
}

function EmergencyCard({
  label,
  number,
  href,
}: {
  label: string;
  number: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-2xl bg-crema/10 hover:bg-crema/15 transition p-4"
    >
      <div className="text-xs text-crema/70">{label}</div>
      <div className="text-xl font-semibold tracking-wide mt-1">{number}</div>
    </a>
  );
}
