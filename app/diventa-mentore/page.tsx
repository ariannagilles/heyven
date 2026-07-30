import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MentorFaqAccordion from "@/components/mentor/MentorFaqAccordion";

export const metadata: Metadata = {
  title: "Diventa Mentore — Heyven",
  description:
    "Esserci per qualcun altro: diventa Mentore di Heyven con formazione, ascolto scritto e un ruolo che conta.",
};

const BODY =
  "text-[16px] leading-[1.6] text-cream md:text-[17px] md:leading-[1.65]";
const BODY_MUTED = "text-[15px] leading-[1.6] text-cream/[0.72]";

const TIMELINE = [
  "Ci scrivi.",
  "Ti rispondiamo.",
  "Formazione online, sei moduli.",
  "Tre conversazioni di prova.",
  "Inizi.",
] as const;

const BENEFIT_BLOCKS = [
  {
    num: "01",
    title: "Una formazione seria.",
    body: "Sei moduli sull'ascolto scritto, sul riconoscere i segnali di rischio e sui limiti del ruolo. Alla fine ricevi un attestato con le ore fatte, firmato da Heyven.",
  },
  {
    num: "02",
    title: "La tua esperienza che diventa utile.",
    body: "Quello che hai attraversato smette di essere solo una cosa tua e diventa la ragione per cui stanotte una persona si sente meno sola.",
  },
  {
    num: "03",
    title: "Un ruolo che dice chi sei.",
    body: "Essere Mentore di Heyven non è una riga in più nel curriculum: è una selezione superata e una formazione portata a termine. Chi legge che sei Mentore sa che hai preso la cosa più difficile che ti è capitata e hai deciso di metterla al servizio di qualcun altro. Non capita a molti di poterlo dimostrare.",
  },
] as const;

const QUALITY_CARDS = [
  {
    roman: "I",
    title: "Selezione",
    body: "Non tutti diventano Mentori. Ogni candidatura è letta e valutata su tre domande che dicono molto più di un CV.",
  },
  {
    roman: "II",
    title: "Formazione",
    body: "Sei moduli sull'ascolto scritto e sui limiti del ruolo, con una verifica finale. Chi non la passa non parte.",
  },
  {
    roman: "III",
    title: "Supervisione",
    body: "Ogni Mentore ha al suo fianco una specializzanda in psicoterapia. Nessuno resta solo davanti a una conversazione difficile.",
  },
] as const;

const PRIMARY_CTA =
  "inline-flex items-center justify-center rounded-[14px] bg-cream px-8 py-4 text-[16px] font-semibold text-petrolio transition-transform duration-300 ease-out active:scale-[0.98] motion-reduce:transition-none md:text-[17px]";

const GHOST_CTA =
  "inline-flex items-center justify-center rounded-[14px] border border-cream/40 bg-transparent px-8 py-4 text-[16px] font-semibold text-cream transition-colors duration-300 ease-out hover:bg-cream/[0.06] active:scale-[0.98] motion-reduce:transition-none md:text-[17px]";

const INTERMEDIATE_CTA =
  "inline-flex items-center justify-center rounded-[14px] bg-cream px-9 py-4 text-[15px] font-semibold text-petrolio transition-transform duration-300 ease-out active:scale-[0.98] motion-reduce:transition-none";

const MENTOR_LIMITS = [
  "Non fa terapia",
  "Non fa diagnosi",
  "Non dà indicazioni sui farmaci",
  "Non dice a nessuno cosa fare della propria vita",
  "Non si sposta su altri canali",
] as const;

export default function DiventaMentorePage() {
  return (
    <>
      <main className="pb-24">
        {/* HERO */}
        <section className="relative flex min-h-[90vh] min-h-[90dvh] items-center md:min-h-[85vh] md:min-h-[85dvh]">
          <div className="pointer-events-none absolute inset-0 -z-[1]">
            <Image
              src="/mentore/mani.jpg"
              alt=""
              fill
              priority
              className="object-cover opacity-[0.42]"
              sizes="100vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-[rgba(4,52,44,0.55)] via-[rgba(4,52,44,0.75)] to-[rgba(4,52,44,0.95)]"
              aria-hidden
            />
          </div>

          <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-24 text-center md:py-20 md:pt-24 md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[1.2px] text-cream/60">
              Diventa Mentore
            </p>
            <h1 className="font-display mt-4 text-[clamp(2.6rem,6vw,4.5rem)] leading-[1.05] text-cream">
              C&apos;è stato un momento in cui avresti voluto una persona così.
            </h1>
            <p className="font-display mt-4 text-[clamp(1.6rem,3.5vw,2.4rem)] italic leading-snug text-cream/[0.85]">
              Adesso puoi esserla.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:mt-[32px] md:justify-start">
              <Link href="/diventa-mentore/candidatura" className={PRIMARY_CTA}>
                Raccontaci di te
              </Link>
              <a href="#come-funziona" className={GHOST_CTA}>
                Come funziona
              </a>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4">
          {/* BLOCCO 1 */}
          <section className="pt-24 pb-16">
            <h2 className="font-display text-[2rem] leading-tight text-cream">
              Perché esiste Heyven
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-10">
              <p className={BODY}>
                In Italia una persona su quattro convive con un disagio mentale,
                e sette su dieci non ne parlano con nessuno. Con gli amici ci si
                sente fraintesi, in famiglia non si vuole preoccupare, con gli
                altri certe cose non si dicono.
              </p>
              <p className={BODY}>
                Quando si decide di chiedere aiuto, l&apos;unica strada resta lo
                psicologo: ottanta euro a seduta, spesso mesi di attesa. Molte
                persone non ci arrivano. Altre non si sentono ancora pronte, e
                aspettano che passi.
              </p>
            </div>
            <p className="mt-10 max-w-3xl text-[17px] leading-[1.65] text-cream md:mt-12 md:text-[18px]">
              Heyven nasce per quel tempo in mezzo. È il posto dove si può dire
              come si sta davvero prima di sapere se serve una terapia, e dove
              c&apos;è qualcuno che ha già attraversato la stessa cosa.
            </p>
            <p className="font-display mt-8 text-left text-[1.4rem] italic leading-snug text-cream">
              Quel qualcuno è il Mentore.
            </p>
          </section>

          {/* BLOCCO 2 · DATI */}
          <section className="rounded-[24px] bg-cream/[0.03] px-6 py-16 md:px-12 md:py-20">
            <div className="grid gap-10 md:grid-cols-2 md:gap-0">
              <div className="text-center md:border-r md:border-cream/[0.16] md:pr-10">
                <p className="font-display text-[clamp(4rem,12vw,7rem)] font-medium leading-none text-mint">
                  1 su 4
                </p>
                <p className={`mt-4 ${BODY_MUTED}`}>
                  In Italia convive con un disagio mentale.
                </p>
              </div>
              <div className="border-t border-cream/[0.16] pt-10 text-center md:border-t-0 md:pt-0 md:pl-10">
                <p className="font-display text-[clamp(4rem,12vw,7rem)] font-medium leading-none text-gold">
                  7 su 10
                </p>
                <p className={`mt-4 ${BODY_MUTED}`}>Non ne parla con nessuno.</p>
              </div>
            </div>
          </section>

          {/* IMMAGINE ATMOSFERA */}
          <div className="my-24">
            <div className="mentor-image aspect-[3/2] w-full md:aspect-[21/9]">
              <Image
                src="/mentore/atmosfera.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1024px"
              />
            </div>
          </div>

          {/* BLOCCO 3 */}
          <section className="mx-auto max-w-[620px] text-center">
            <h2 className="font-display text-[clamp(2rem,4vw,2.8rem)] leading-tight text-cream">
              Esserci per qualcun altro
            </h2>
            <div className="mt-8 space-y-5 text-left">
              <p className="text-[17px] leading-[1.65] text-cream md:text-[18px]">
                C&apos;è stato un momento in cui stavi male e nessuno lo sapeva.
              </p>
              <p className="text-[17px] leading-[1.65] text-cream md:text-[18px]">
                Adesso puoi essere tu quello che c&apos;è, per qualcuno che è lì
                adesso.
              </p>
              <p className="text-[17px] leading-[1.65] text-cream md:text-[18px]">
                Diventare Mentore di Heyven vuol dire prendere la cosa più pesante
                che ti è capitata e farne qualcosa che serve. Non è volontariato.
                È il ruolo su cui poggia tutta la piattaforma. Se Heyven esiste,
                è grazie a te.
              </p>
            </div>
          </section>
        </div>

        {/* PULL QUOTE */}
        <section className="relative my-24 flex min-h-[60vh] min-h-[60dvh] items-center justify-center px-4">
          <div className="pointer-events-none absolute inset-0 -z-[1]">
            <Image
              src="/mentore/luce.jpg"
              alt=""
              fill
              className="object-cover object-center opacity-[0.55]"
              sizes="100vw"
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,52,44,0)_0%,rgba(4,52,44,0.45)_55%,rgba(4,52,44,0.88)_100%)]"
              aria-hidden
            />
          </div>
          <blockquote className="relative mx-auto max-w-[640px] text-center">
            <span
              className="font-display block text-[clamp(4rem,12vw,8rem)] leading-none text-cream/20"
              aria-hidden
            >
              &ldquo;
            </span>
            <p className="font-display -mt-6 text-[clamp(1.8rem,4vw,2.8rem)] italic leading-[1.3] text-cream">
              Sono qui perché qualcuno c&apos;è stato per me. Adesso tocca a me.
            </p>
          </blockquote>
        </section>

        <div className="mx-auto max-w-5xl px-4">
          {/* BLOCCO 4 */}
          <section id="come-funziona" className="scroll-mt-24">
            <h2 className="font-display text-[2rem] leading-tight text-cream">
              Come funziona
            </h2>
            <div className={`glass-card mt-12 space-y-5 p-8 md:p-12 ${BODY}`}>
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

          <section className="py-14 text-center">
            <p className="text-[16px] leading-[1.6] text-cream/[0.72]">
              Se ti riconosci in questo, il passo dopo è breve.
            </p>
            <Link
              href="/diventa-mentore/candidatura"
              className={`${INTERMEDIATE_CTA} mt-5`}
            >
              Raccontaci di te
            </Link>
          </section>

          {/* BLOCCO 5 · NUMERATO */}
          <section className="mt-24">
            <h2 className="font-display text-[2rem] leading-tight text-cream">
              Cosa ti porti a casa
            </h2>
            <div className="pt-12">
              {BENEFIT_BLOCKS.map((block, index) => (
                <article key={block.num}>
                  {index > 0 && (
                    <div className="my-10 border-t border-cream/[0.12]" aria-hidden />
                  )}
                  <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                    <p className="font-display shrink-0 text-[clamp(3rem,6vw,4.5rem)] font-normal leading-none text-mint opacity-85 md:w-[120px]">
                      {block.num}
                    </p>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-medium leading-snug text-cream">
                        {block.title}
                      </h3>
                      <p className="mt-3 text-[16px] leading-[1.6] text-cream/[0.85] md:text-[17px]">
                        {block.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* BLOCCO 6 */}
          <section className="mt-24">
            <h2 className="font-display text-[2rem] leading-tight text-cream">
              Cosa un Mentore non fa
            </h2>
            <div className={`glass-card mt-12 p-8 md:p-10 ${BODY}`}>
              <ul className="space-y-3" role="list">
                {MENTOR_LIMITS.map((item) => (
                  <li key={item} className="flex gap-3 text-[16px] leading-[1.6] md:text-[17px]">
                    <span className="shrink-0 text-cream/60" aria-hidden>
                      ×
                    </span>
                    <span className="text-cream">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[16px] leading-[1.6] text-cream md:text-[17px]">
                Questi limiti tengono il ruolo sostenibile. A un Mentore non si
                chiede di risolvere la vita di qualcuno, si chiede di esserci
                mentre la attraversa.
              </p>
            </div>
          </section>

          {/* BLOCCO 7 · SOCIAL PROOF */}
          <section className="mt-24 rounded-[24px] bg-cream/[0.03] px-6 py-12 md:px-10 md:py-16">
            <h2 className="font-display text-[2rem] leading-tight text-cream">
              Come garantiamo la qualità
            </h2>
            <p className={`mt-12 max-w-2xl ${BODY}`}>
              Ogni Mentore Heyven è tra i pochissimi in Italia ad aver completato
              selezione, formazione e supervisione. Ecco cosa significa.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {QUALITY_CARDS.map((card) => (
                <article key={card.title} className="glass-card p-8">
                  <span
                    className="flex h-8 w-8 items-center justify-center font-display text-sm text-mint"
                    aria-hidden
                  >
                    {card.roman}
                  </span>
                  <h3 className="mt-4 text-[1.1rem] font-medium text-cream">
                    {card.title}
                  </h3>
                  <p className={`mt-3 ${BODY_MUTED}`}>{card.body}</p>
                </article>
              ))}
            </div>
            <p className="font-display mt-12 text-center text-[clamp(1.25rem,3vw,1.75rem)] leading-snug text-cream">
              Oggi su Heyven ci sono{" "}
              <span className="font-medium text-mint">47</span> Mentori attivi.
            </p>
            <p className="mt-2 text-center text-[13px] text-cream/60">
              Un numero che vogliamo far crescere insieme.
            </p>
          </section>

          {/* BLOCCO 8 */}
          <section className="mt-24">
            <h2 className="font-display text-[2rem] leading-tight text-cream">
              Chi cerchiamo
            </h2>
            <div className="mt-12 max-w-[640px] space-y-5">
              <p className="text-[17px] leading-[1.65] text-cream">
                Persone che hanno vissuto ansia, depressione, un disturbo
                alimentare, un lutto, un burnout, una relazione che faceva male,
                e che oggi riescono a parlarne senza sprofondarci.
              </p>
              <p className="text-[17px] leading-[1.65] text-cream">
                Chi si trova bene a scrivere, perché qui si ascolta leggendo. Chi
                ha già ascoltato qualcuno in passato è avvantaggiato, anche fuori
                da contesti organizzati.
              </p>
              <p className="text-[17px] leading-[1.65] text-cream">
                Non servono titoli di studio. Se ne hai, non sono un problema.
              </p>
            </div>
            <div className="mt-8 max-w-[640px] rounded-[20px] border border-mint/20 bg-mint/[0.06] p-6">
              <p className="text-[16px] italic leading-[1.6] text-cream/[0.85]">
                Se in questo periodo stai attraversando qualcosa di pesante,
                aspetta. Non è un no: adesso è il tuo momento di ricevere.
                Riscrivici quando ti va.
              </p>
            </div>
          </section>

          {/* BLOCCO 9 · TIMELINE */}
          <section className="mt-24">
            <h2 className="font-display text-[2rem] leading-tight text-cream">
              Come si diventa Mentore
            </h2>
            <ol className="relative mt-12 space-y-[72px]">
              {TIMELINE.map((text, index) => (
                <li key={text} className="relative flex gap-5 pl-0">
                  {index < TIMELINE.length - 1 && (
                    <span
                      className="absolute left-[7px] top-4 h-[calc(100%+72px)] w-0.5 bg-cream/[0.16]"
                      aria-hidden
                    />
                  )}
                  <span
                    className="relative z-[1] mt-0.5 h-4 w-4 shrink-0 rounded-full bg-mint"
                    aria-hidden
                  />
                  <p className="min-w-0 flex-1 text-[17px] font-medium leading-[1.6] text-cream">
                    <span className="font-display mr-2 text-[1.1rem] text-mint opacity-70">
                      {index + 1}.
                    </span>
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="py-14 text-center">
            <p className="text-[16px] leading-[1.6] text-cream/[0.72]">
              Il primo passo lo fai adesso.
            </p>
            <Link
              href="/diventa-mentore/candidatura"
              className={`${INTERMEDIATE_CTA} mt-5`}
            >
              Diventa Mentore
            </Link>
          </section>

          {/* FAQ */}
          <section className="mt-24">
            <h2 className="font-display text-[clamp(2rem,4vw,2.6rem)] leading-tight text-cream">
              Le domande più comuni
            </h2>
            <div className="mt-12">
              <MentorFaqAccordion />
            </div>
          </section>

          {/* BLOCCO 10 · CTA FINALE */}
          <section className="py-24 text-center">
            <h2 className="font-display text-[clamp(2rem,4vw,2.6rem)] leading-tight text-cream">
              Diventa Mentore. Fai parte del cambiamento.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[17px] leading-[1.6] text-cream/[0.72]">
              Bastano dieci minuti per raccontarci di te.
            </p>
            <Link
              href="/diventa-mentore/candidatura"
              className={`${PRIMARY_CTA} mt-10 px-12 py-5 text-[1.1rem]`}
            >
              Raccontaci di te
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
