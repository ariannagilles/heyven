import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Se questo è un momento difficile — Heyven",
  description:
    "Numeri utili e risorse di emergenza per la salute mentale in Italia.",
};

const HELPLINES = [
  {
    name: "Telefono Amico Italia",
    number: "02 2327 2327",
    tel: "tel:0223272327",
    hours: "Tutti i giorni, 10–24",
  },
  {
    name: "Numero Europeo Armonizzato per la prevenzione del suicidio",
    number: "800 861 061",
    tel: "tel:800861061",
    hours: "Attivo 24/7",
  },
  {
    name: "112 — Numero Unico Emergenze",
    number: "112",
    tel: "tel:112",
    hours: "Attivo 24/7",
  },
] as const;

export default function AiutoPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 pb-20 space-y-10">
        <header className="space-y-4">
          <h1 className="text-2xl font-semibold leading-snug">
            Se questo è un momento difficile
          </h1>
          <p className="text-base leading-relaxed text-petrolio/80">
            Non sei obbligato a farcela da solo. Qui trovi chi risponde davvero,
            anche adesso.
          </p>
        </header>

        <section className="space-y-4" aria-labelledby="numeri-utili">
          <h2 id="numeri-utili" className="text-lg font-semibold">
            Numeri utili
          </h2>

          <ul className="space-y-4">
            {HELPLINES.map((line) => (
              <li key={line.tel}>
                <article className="card p-5 space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-medium leading-snug">
                      {line.name}
                    </h3>
                    <p className="text-xl font-semibold tracking-wide tabular-nums">
                      {line.number}
                    </p>
                    <p className="text-base text-petrolio/70">{line.hours}</p>
                  </div>
                  <a href={line.tel} className="btn-outline w-full sm:w-auto">
                    Chiama {line.number}
                  </a>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3 border-t border-petrolio/10 pt-8">
          <h2 className="text-lg font-semibold leading-snug">
            Se sei preoccupato per qualcun altro
          </h2>
          <p className="text-base leading-relaxed text-petrolio/80">
            Restare in ascolto, senza giudicare, è già molto. Se pensi che una
            persona sia in pericolo immediato, chiama il 112.
          </p>
        </section>
      </main>
    </>
  );
}
