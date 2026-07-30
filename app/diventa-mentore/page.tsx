import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SectionLabel from "@/components/SectionLabel";

export const metadata: Metadata = {
  title: "Diventa Mentore — Heyven",
  description:
    "Esserci per qualcun altro: diventa Mentore di Heyven con formazione, ascolto scritto e un ruolo che conta.",
};

const BODY = "text-[16px] leading-[1.6] text-cream md:text-[17px]";

const TIMELINE = [
  "Ci scrivi.",
  "Ti rispondiamo.",
  "Formazione online, sei moduli.",
  "Tre conversazioni di prova.",
  "Inizi.",
] as const;

export default function DiventaMentorePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-14 px-4 pb-24 pt-8">
        <section className="space-y-4">
          <SectionLabel>PERCHÉ ESISTE HEYVEN</SectionLabel>
          <div className={`space-y-4 ${BODY}`}>
            <p>
              In Italia una persona su quattro convive con un disagio mentale, e
              sette su dieci non ne parlano con nessuno. Con gli amici ci si
              sente fraintesi, in famiglia non si vuole preoccupare, con gli
              altri certe cose non si dicono.
            </p>
            <p>
              Quando si decide di chiedere aiuto, l&apos;unica strada resta lo
              psicologo: ottanta euro a seduta, spesso mesi di attesa. Molte
              persone non ci arrivano. Altre non si sentono ancora pronte, e
              aspettano che passi.
            </p>
            <p>
              Heyven nasce per quel tempo in mezzo. È il posto dove si può dire
              come si sta davvero prima di sapere se serve una terapia, e dove
              c&apos;è qualcuno che ha già attraversato la stessa cosa.
            </p>
          </div>
          <p className={`font-medium text-cream ${BODY}`}>
            Quel qualcuno è il Mentore.
          </p>
        </section>

        <section className="space-y-4">
          <h1 className="font-display text-[28px] leading-tight text-cream md:text-[32px]">
            Esserci per qualcun altro
          </h1>
          <div className={`space-y-4 ${BODY}`}>
            <p>
              C&apos;è stato un momento in cui stavi male e nessuno lo sapeva.
            </p>
            <p>
              Adesso puoi essere tu quello che c&apos;è, per qualcuno che è lì
              adesso.
            </p>
            <p>
              Diventare Mentore di Heyven vuol dire prendere la cosa più pesante
              che ti è capitata e farne qualcosa che serve. Non è volontariato.
              È il ruolo su cui poggia tutta la piattaforma. Se Heyven esiste, è
              grazie a te.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <SectionLabel>COME FUNZIONA</SectionLabel>
          <div className={`glass-card space-y-4 p-5 ${BODY}`}>
            <p>
              Ti vengono affidate le persone con cui condividi un&apos;esperienza
              simile. Vi scrivete in chat, e la continuità è la parte che conta:
              chi ti scrive si aspetta di ritrovarti.
            </p>
            <p>
              Il tuo lavoro è leggere e restare. A volte basta far sapere che
              hai letto. A volte racconti la tua parte, perché sapere che
              qualcuno ne è uscito cambia tutto. Se senti che serve altro, puoi
              accompagnare la persona a scoprire la terapia.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <SectionLabel>COSA TI PORTI A CASA</SectionLabel>
          <div className="space-y-3">
            <article className={`glass-card space-y-2 p-5 ${BODY}`}>
              <h2 className="font-medium text-cream">Una formazione seria.</h2>
              <p>
                Sei moduli sull&apos;ascolto scritto, sul riconoscere i segnali
                di rischio e sui limiti del ruolo. Quattro-sei ore online. Alla
                fine ricevi un attestato con le ore fatte, firmato da Heyven.
              </p>
            </article>
            <article className={`glass-card space-y-2 p-5 ${BODY}`}>
              <h2 className="font-medium text-cream">
                La tua esperienza che diventa utile.
              </h2>
              <p>
                Quello che hai attraversato smette di essere solo una cosa tua e
                diventa la ragione per cui stanotte una persona si sente meno
                sola.
              </p>
            </article>
            <article className={`glass-card space-y-2 p-5 ${BODY}`}>
              <h2 className="font-medium text-cream">
                Un ruolo che dice chi sei.
              </h2>
              <p>
                Essere Mentore di Heyven non è una riga in più nel curriculum: è
                una selezione superata e una formazione portata a termine. Chi
                legge che sei Mentore sa che hai preso la cosa più difficile che
                ti è capitata e hai deciso di metterla al servizio di qualcun
                altro. Non capita a molti di poterlo dimostrare.
              </p>
            </article>
          </div>
        </section>

        <section className="space-y-4">
          <SectionLabel>COSA UN MENTORE NON FA</SectionLabel>
          <div className={`glass-card space-y-4 p-5 ${BODY}`}>
            <p>
              Non fa terapia e non fa diagnosi. Non dà indicazioni sui farmaci.
              Non dice a nessuno cosa fare della propria vita. Non si sposta su
              altri canali.
            </p>
            <p>
              Questi limiti tengono il ruolo sostenibile. A un Mentore non si
              chiede di risolvere la vita di qualcuno, si chiede di esserci
              mentre la attraversa.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <SectionLabel>CHI CERCHIAMO</SectionLabel>
          <div className={`space-y-4 ${BODY}`}>
            <p>
              Persone che hanno vissuto ansia, depressione, un disturbo
              alimentare, un lutto, un burnout, una relazione che faceva male,
              e che oggi riescono a parlarne senza sprofondarci.
            </p>
            <p>
              Chi si trova bene a scrivere, perché qui si ascolta leggendo. Chi
              ha già ascoltato qualcuno in passato è avvantaggiato, anche fuori
              da contesti organizzati.
            </p>
            <p>Non servono titoli di studio. Se ne hai, non sono un problema.</p>
            <p className="italic text-cream/60">
              Se in questo periodo stai attraversando qualcosa di pesante,
              aspetta. Non è un no: adesso è il tuo momento di ricevere.
              Riscrivici quando ti va.
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <SectionLabel>COME SI DIVENTA MENTORE</SectionLabel>
          <ol className="relative space-y-6 pl-0">
            {TIMELINE.map((text, index) => (
              <li key={text} className="relative flex gap-4 pl-1">
                {index < TIMELINE.length - 1 && (
                  <span
                    className="absolute left-[5px] top-3 h-[calc(100%+12px)] w-0.5 bg-cream/[0.16]"
                    aria-hidden
                  />
                )}
                <span
                  className="relative z-[1] mt-1.5 h-3 w-3 shrink-0 rounded-full bg-mint"
                  aria-hidden
                />
                <p className={`min-w-0 flex-1 ${BODY}`}>
                  <span className="font-medium text-mint">{index + 1}. </span>
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex justify-center pt-2">
          <Link
            href="/diventa-mentore/candidatura"
            className="inline-flex items-center justify-center rounded-[14px] bg-cream px-8 py-4 text-[16px] font-semibold text-petrolio transition-transform active:scale-[0.98]"
          >
            Raccontaci di te
          </Link>
        </div>
      </main>
    </>
  );
}
