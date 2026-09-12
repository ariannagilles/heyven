# Heyven — istruzioni per Claude Code

Heyven è una community italiana anonima di supporto tra pari, prima della terapia.
Stack: Next.js 14 (App Router), Tailwind, Supabase (Postgres + Auth + Realtime).

## Regole ferme di design (NON negoziabili)
- Niente rosso da nessuna parte, mai. Nemmeno per errori o stati negativi.
  Errori: sfondo #D4EDE5, testo #04342C. Valutazioni basse: sabbia #B9AE93, mai rosso.
- Palette Variante A: petrolio #04342C, petrolio-2 #0B3F34, teal #0F6E56,
  teal-mid #1D9E75, mint #5DCAA5, cream #F5EFE3, gold #CDA24E.
- Ambra #EAC77A SOLO per i banner di sicurezza (at-risk). Mai decorativo.
- Titoli con font Fraunces. Corpo minimo 16px (17 su mobile), interlinea generosa.
- Niente numeri sull'umore, niente punteggi, niente griglie semaforiche, niente streak,
  niente contatori d'uso, niente countdown, niente dark pattern.
- Componenti base: .glass-card, .field-input, SectionLabel, bottom nav flottante
  (Casa / Spazi / Scrivi centrale / Mentore / Tu). Riusa questi, non reinventarli.

## Copy
- Tutto in italiano, tono caldo e diretto, come si direbbe a voce.
- Vietati i "tic da AI": frasi a effetto spezzate, trattini lunghi, stime di tempo,
  slogan a coppie di frasi in contrasto, sottotitoli tipo "e cosa c'entriamo noi".
- Le etichette visibili (spazi, stati d'animo, tag) vivono in costanti dedicate
  (es. lib/moods.ts, spaces). Mai hardcodarle nei componenti: slug/id/chiavi DB non cambiano.

## Database e SQL — REGOLA CRITICA
- NON eseguire mai SQL. NON creare migrazioni ed eseguirle.
- Cursor/Claude Code e Supabase sono sistemi separati: lo SQL lo scrive e lo esegue
  Alessandro a mano nel SQL Editor di Supabase, dopo revisione.
- Se serve una modifica al database, NON farla: descrivi cosa serve e fermati.
- Nota storica: conversations.mentor_id fa coppia con profiles.id / mentors.user_id
  (in mentors NON esiste la colonna id). È già stata fonte di bug silenziosi.

## Modo di lavorare
- Prima di modificare o creare file, mostra il piano: quali file tocchi e perché.
  Applica solo dopo conferma esplicita.
- Alla fine di un lavoro confermato: fai commit e push su main.
- Le decisioni tecniche di dettaglio le prendi tu; solleva solo i bivi veri.
