"use client";

import { useEffect, useId, useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Per quante persone sarò Mentore?",
    answer:
      "Lo decidi tu. Dal tuo profilo puoi impostare quante conversazioni attive vuoi seguire insieme, e il sistema si ferma da solo quando raggiungi il tuo limite.",
  },
  {
    question: "Quanto tempo richiede il ruolo?",
    answer:
      "Non c'è un numero fisso di ore. Dal tuo profilo indichi quando sei disponibile e in che fasce orarie, e puoi metterti in pausa in qualsiasi momento — anche solo per una settimana — senza doverlo giustificare a nessuno.",
  },
  {
    question: "Devo avere una formazione in psicologia?",
    answer:
      "No. Cerchiamo persone che hanno vissuto qualcosa di simile a quello che leggeranno, non titoli di studio. La formazione che facciamo insieme copre quello che serve per il ruolo.",
  },
  {
    question: "È un lavoro retribuito?",
    answer:
      "Oggi il ruolo di Mentore non prevede una retribuzione fissa. Quello che offriamo con certezza è una formazione seria, un attestato con le ore fatte, e un ruolo che pesa davvero in quello che fai dopo. Stiamo lavorando a un modello di riconoscimento più strutturato, e chi è già dentro lo saprà per primo.",
  },
  {
    question:
      "E se durante il percorso capisco che non è il momento giusto per me?",
    answer:
      "Puoi fermarti quando vuoi, in ogni fase. Non è un impegno a vita, ed è meglio dirlo prima che dopo.",
  },
  {
    question: "Cosa succede se la mia candidatura non viene accettata?",
    answer:
      "Te lo diciamo con chiarezza e, se il momento non è quello giusto, puoi ricandidarti più avanti. Non cambia nulla nel tuo rapporto con Heyven come utente.",
  },
  {
    question: "Posso candidarmi se sono già psicologo o specializzando?",
    answer:
      "Sì. Non c'è un'etichetta diversa per chi ha già una formazione clinica: il ruolo di Mentore è lo stesso per tutti.",
  },
  {
    question: "Come faccio a iniziare?",
    answer:
      "Ci scrivi con il modulo qui sotto. Ti rispondiamo con calma, e da lì parte la formazione.",
  },
] as const;

const TRIGGER_FOCUS =
  "rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a2b25]";

export default function MentorFaqAccordion() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <div className="border-t border-cream/[0.12]">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        const answerId = `${baseId}-answer-${index}`;
        const triggerId = `${baseId}-trigger-${index}`;

        return (
          <div key={item.question} className="border-b border-cream/[0.12]">
            <h3 className="m-0">
              <button
                id={triggerId}
                type="button"
                className={`flex w-full items-start justify-between gap-4 py-5 text-left ${TRIGGER_FOCUS}`}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggle(index)}
              >
                <span className="min-w-0 flex-1 text-[17px] font-medium leading-snug text-cream">
                  {item.question}
                </span>
                <span
                  className="mt-0.5 shrink-0 text-lg leading-none text-cream/60 transition-transform duration-[250ms] ease-out motion-reduce:transition-none"
                  aria-hidden
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={answerId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              hidden={reduceMotion ? !isOpen : undefined}
              className={
                reduceMotion
                  ? isOpen
                    ? "block"
                    : "hidden"
                  : `grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`
              }
            >
              <div className={reduceMotion ? undefined : "overflow-hidden"}>
                <p className="pt-3 pb-5 text-[16px] leading-[1.6] text-cream/[0.85]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
