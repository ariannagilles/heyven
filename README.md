# Heyven — MVP

Community italiana, anonima, per la salute mentale.
Stack: **Next.js 14 (App Router)** · **Supabase** · **Tailwind CSS**.

## Setup

### 1. Database

Apri il **SQL Editor** del tuo progetto Supabase e incolla l'intero contenuto di
[`schema.sql`](./schema.sql). Esegui. Crea tabelle, indici, RLS e il trigger che
genera automaticamente il profilo (con nickname) alla registrazione.

### 2. Auth

In Supabase → **Authentication → Providers → Email**:

- **Enable Email provider**: on
- **Confirm email**: a tua scelta.
  - Se **off** → registrazione + login immediati (consigliato per testare).
  - Se **on** → l'utente riceve una mail di conferma. Imposta il
    **Site URL** a `http://localhost:3000` e aggiungi
    `http://localhost:3000/auth/callback` tra i Redirect URLs.

### 3. Variabili d'ambiente

Sono già configurate in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. Avvio

```bash
npm install
npm run dev
```

Apri http://localhost:3000.

## Struttura

```
app/
  page.tsx              feed home
  login/                login
  register/             registrazione (con scelta nickname)
  new/                  crea post (scelta spazio + testo)
  post/[id]/            dettaglio post, risposte, anch'io
  spaces/               lista spazi tematici
  spaces/[slug]/        feed filtrato per spazio
  auth/callback/        scambio code → session (email confirm)
components/             PostCard, Navbar, MeTooButton, ReplyForm, LogoutButton
lib/supabase/           client (browser) + server (cookies) helpers
lib/spaces.ts           costanti spazi tematici
middleware.ts           protegge le rotte richiedendo l'auth
schema.sql              schema DB + RLS + trigger profili
```

## Design

- Colore principale: petrolio `#1a3a3a`
- Sfondo: crema `#f5ead7`
- Mobile-first, container massimo `max-w-2xl`
- Tutti gli utenti sono identificati solo dal proprio **nickname anonimo**.

## Spazi tematici

`Ansia`, `Depressione`, `DCA`, `Burnout`, `Relazioni`, `Solitudine`, `Lutto`, `Identità`.

## Chat con il mentore

- Ogni utente registrato vede in home una card **"Il tuo Mentore ti aspetta"**
  (o **"Continua la chat con il tuo Mentore"** se ha già una conversazione).
- La navbar mostra un **bottone con icona chat**; un pallino rosso compare
  quando ci sono messaggi non letti.
- Quando l'utente apre la chat per la prima volta viene assegnato al mentore
  con meno utenti attivi (RPC `assign_mentor`, security definer).
- I messaggi sono in tempo reale via **Supabase Realtime** (publication su
  `public.messages`).
- L'utente può **chiudere la chat** e lasciare una valutazione (1–5 stelle +
  feedback opzionale). Il rating si salva in `mentor_ratings` (invisibile agli
  utenti: nessuna RLS policy → leggibile solo via service_role).
- Se un mentore ha **≥ 3 valutazioni** con media **< 3 stelle**, viene
  automaticamente segnato `flagged_for_review = true` nella tabella `mentors`.

### Promuovere un utente a mentore

Nel SQL Editor di Supabase (l'utente deve essersi già registrato):

```sql
update public.profiles
   set role = 'mentor'
 where nickname = 'IL_NICKNAME';
```

Il trigger crea automaticamente la riga in `public.mentors`.
Per disabilitare/abilitare la disponibilità di un mentore:

```sql
update public.mentors set is_available = false where user_id = '...';
```

### Promuovere un utente a admin

```sql
update public.profiles
   set role = 'admin'
 where nickname = 'IL_NICKNAME';
```

L'admin vede in navbar un'icona scudo che porta a `/admin`. Lì può:
- Vedere ogni mentore con rating medio, numero di valutazioni, conversazioni totali, attive ora
- Rimuovere il flag `is_flagged` dai mentori segnalati

## Chiusura conversazione e rating

- Sia **utente** che **mentore** vedono un bottone **"Chiudi conversazione"**
  nell'header della chat.
- Click → modale di conferma → `close_conversation(p_conversation_id)` setta
  `status = 'closed'` (la riga resta, i messaggi restano visibili, ma nessuno
  dei due può scrivere più).
- Se è **l'utente** a chiudere → viene portato a `/chat/rate?c=<id>` per
  valutare il mentore (5 stelle + feedback opzionale + bottoni `Invia`/`Salta`).
- Il rating va in `mentor_ratings`. Se il mentore ha **≥ 3 valutazioni** e
  media **< 3 stelle**, viene segnato `profiles.is_flagged = true`
  (visibile solo all'admin in dashboard).
- Dopo aver chiuso la chat, l'utente può aprirne una nuova: l'indice
  `conversations_one_active_per_user` consente al massimo una conversazione
  **attiva** per utente, ma non limita lo storico.
