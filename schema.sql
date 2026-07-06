-- ============================================================
-- HEYVEN — schema MVP per community salute mentale
-- Incolla questo file nel SQL Editor di Supabase ed eseguilo.
-- ============================================================

-- 1. PROFILES (nickname anonimo)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 2 and 24),
  created_at timestamptz not null default now()
);

-- 2. SPACES (spazi tematici)
create table if not exists public.spaces (
  slug text primary key,
  name text not null,
  description text,
  sort_order int not null default 0
);

insert into public.spaces (slug, name, description, sort_order) values
  ('ansia',       'Ansia',       'Per chi convive con ansia o attacchi di panico.', 1),
  ('depressione', 'Depressione', 'Uno spazio sicuro per parlare di depressione.',   2),
  ('dca',         'DCA',         'Disturbi del comportamento alimentare.',          3),
  ('burnout',     'Burnout',     'Stress da lavoro, esaurimento, sovraccarico.',    4),
  ('relazioni',   'Relazioni',   'Famiglia, amicizie, amore, legami difficili.',    5),
  ('solitudine',  'Solitudine',  'Sentirsi soli, anche in mezzo agli altri.',       6),
  ('lutto',       'Lutto',       'Perdita e dolore.',                                7),
  ('identita',    'Identità',    'Identità di genere, orientamento, ricerca di sé.', 8)
on conflict (slug) do nothing;

-- 3. POSTS
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  space_slug text not null references public.spaces(slug),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_space_slug_idx on public.posts (space_slug, created_at desc);

-- 4. REPLIES
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists replies_post_id_idx on public.replies (post_id, created_at asc);

-- 5. ME_TOO ("anch'io")
create table if not exists public.me_too (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists me_too_post_id_idx on public.me_too (post_id);

-- 6. TRIGGER: alla creazione di un utente in auth.users crea il profilo
--    usando il nickname passato in raw_user_meta_data.nickname.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'nickname', ''),
      'anon-' || substr(replace(new.id::text, '-', ''), 1, 8)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6b. BACKFILL: crea profili per utenti già esistenti in auth.users
--     (necessario se ti sei registratə prima di applicare questo schema).
insert into public.profiles (id, nickname)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data->>'nickname', ''),
    'anon-' || substr(replace(u.id::text, '-', ''), 1, 8)
  )
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 7. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.spaces   enable row level security;
alter table public.posts    enable row level security;
alter table public.replies  enable row level security;
alter table public.me_too   enable row level security;

-- profiles: tutti gli autenticati possono leggere, ognuno aggiorna solo il proprio
drop policy if exists "profiles_select_all"  on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_select_all"  on public.profiles for select to authenticated using (true);
create policy "profiles_update_self" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- spaces: lettura per tutti gli autenticati
drop policy if exists "spaces_select_all" on public.spaces;
create policy "spaces_select_all" on public.spaces for select to authenticated using (true);

-- posts
drop policy if exists "posts_select_all"  on public.posts;
drop policy if exists "posts_insert_self" on public.posts;
drop policy if exists "posts_delete_self" on public.posts;
create policy "posts_select_all"  on public.posts for select to authenticated using (true);
create policy "posts_insert_self" on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "posts_delete_self" on public.posts for delete to authenticated using (auth.uid() = author_id);

-- replies
drop policy if exists "replies_select_all"  on public.replies;
drop policy if exists "replies_insert_self" on public.replies;
drop policy if exists "replies_delete_self" on public.replies;
create policy "replies_select_all"  on public.replies for select to authenticated using (true);
create policy "replies_insert_self" on public.replies for insert to authenticated with check (auth.uid() = author_id);
create policy "replies_delete_self" on public.replies for delete to authenticated using (auth.uid() = author_id);

-- me_too
drop policy if exists "me_too_select_all"  on public.me_too;
drop policy if exists "me_too_insert_self" on public.me_too;
drop policy if exists "me_too_delete_self" on public.me_too;
create policy "me_too_select_all"  on public.me_too for select to authenticated using (true);
create policy "me_too_insert_self" on public.me_too for insert to authenticated with check (auth.uid() = user_id);
create policy "me_too_delete_self" on public.me_too for delete to authenticated using (auth.uid() = user_id);

-- ============================================================
-- CHAT CON MENTORE
-- ============================================================

-- 8. RUOLO sui profili
alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user','mentor'));

-- 9. MENTORS (pool dei mentori disponibili)
create table if not exists public.mentors (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  is_available boolean not null default true,
  active_users_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists mentors_available_idx
  on public.mentors (is_available, active_users_count);

-- 10. CONVERSATIONS (1 per utente, può essere riassegnata solo cancellandola)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid not null references public.mentors(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- 'status' è usato da policy, viste e funzioni più sotto: deve esistere prima.
alter table public.conversations
  add column if not exists status text not null default 'active';
alter table public.conversations drop constraint if exists conversations_status_check;
alter table public.conversations
  add constraint conversations_status_check check (status in ('active','closed'));

create index if not exists conversations_mentor_idx
  on public.conversations (mentor_id, created_at desc);

-- 11. MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at asc);
create index if not exists messages_unread_idx
  on public.messages (conversation_id, sender_id) where read = false;

-- 12. TRIGGER: sincronizza la tabella mentors quando role cambia
create or replace function public.sync_mentor_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT' and new.role = 'mentor')
     or (tg_op = 'UPDATE' and new.role = 'mentor' and (old.role is distinct from 'mentor')) then
    insert into public.mentors (user_id) values (new.id)
    on conflict (user_id) do nothing;
  elsif (tg_op = 'UPDATE' and old.role = 'mentor' and new.role <> 'mentor') then
    delete from public.mentors where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_after_insert_role on public.profiles;
create trigger profiles_after_insert_role
  after insert on public.profiles
  for each row execute function public.sync_mentor_row();

drop trigger if exists profiles_after_update_role on public.profiles;
create trigger profiles_after_update_role
  after update of role on public.profiles
  for each row execute function public.sync_mentor_row();

-- 13. TRIGGER: aggiorna active_users_count quando una conversation viene cancellata
create or replace function public.on_conversation_delete()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'active' then
    update public.mentors
       set active_users_count = greatest(active_users_count - 1, 0)
     where user_id = old.mentor_id;
  end if;
  return old;
end;
$$;

drop trigger if exists conversations_after_delete on public.conversations;
create trigger conversations_after_delete
  after delete on public.conversations
  for each row execute function public.on_conversation_delete();

-- 14. RPC: assegna l'utente al mentore con meno utenti attivi e crea conversation
create or replace function public.assign_mentor()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing_conv uuid;
  chosen_mentor uuid;
  new_conv uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- self-heal: assicura che il profilo del chiamante esista
  -- (utenti registrati prima dell'applicazione dello schema potrebbero non averlo)
  insert into public.profiles (id, nickname)
  select
    uid,
    coalesce(
      nullif((select raw_user_meta_data->>'nickname' from auth.users where id = uid), ''),
      'anon-' || substr(replace(uid::text, '-', ''), 1, 8)
    )
  where not exists (select 1 from public.profiles where id = uid)
  on conflict (id) do nothing;

  select id into existing_conv
    from public.conversations
   where user_id = uid and status = 'active';
  if existing_conv is not null then
    return existing_conv;
  end if;

  select user_id into chosen_mentor
  from public.mentors
  where is_available = true
    and user_id <> uid
  order by active_users_count asc, random()
  limit 1;

  if chosen_mentor is null then
    raise exception 'no mentors available';
  end if;

  insert into public.conversations (user_id, mentor_id)
  values (uid, chosen_mentor)
  returning id into new_conv;

  update public.mentors
     set active_users_count = active_users_count + 1
   where user_id = chosen_mentor;

  return new_conv;
end;
$$;

revoke all on function public.assign_mentor() from public;
grant execute on function public.assign_mentor() to authenticated;

-- 15. VIEW per la dashboard mentore (rispetta RLS grazie a security_invoker)
-- DROP esplicito: CREATE OR REPLACE VIEW non permette di riordinare/rinominare
-- colonne esistenti (rispetto a una versione precedente della view).
drop view if exists public.mentor_chats;
create view public.mentor_chats
with (security_invoker = on) as
select
  c.id            as conversation_id,
  c.user_id,
  c.mentor_id,
  c.status,
  c.created_at,
  p.nickname      as user_nickname,
  coalesce(
    (select max(m.created_at) from public.messages m where m.conversation_id = c.id),
    c.created_at
  ) as last_activity_at,
  (select m.content from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc limit 1) as last_message,
  (select count(*) from public.messages m
    where m.conversation_id = c.id
      and m.read = false
      and m.sender_id <> c.mentor_id) as unread_for_mentor
from public.conversations c
join public.profiles p on p.id = c.user_id;

-- 16. RLS sulle nuove tabelle
alter table public.mentors       enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- mentors: ognuno legge/aggiorna solo la propria riga (per toggle is_available)
drop policy if exists "mentors_select_self" on public.mentors;
drop policy if exists "mentors_update_self" on public.mentors;
create policy "mentors_select_self" on public.mentors
  for select to authenticated using (auth.uid() = user_id);
create policy "mentors_update_self" on public.mentors
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- conversations: visibili al proprietario (utente o mentore). Inserimento
-- avviene solo via RPC assign_mentor (security definer), quindi nessuna
-- policy di insert per i client. Delete consentito al proprio utente.
drop policy if exists "conversations_select_member" on public.conversations;
drop policy if exists "conversations_delete_self"   on public.conversations;
create policy "conversations_select_member" on public.conversations
  for select to authenticated
  using (user_id = auth.uid() or mentor_id = auth.uid());
create policy "conversations_delete_self" on public.conversations
  for delete to authenticated using (user_id = auth.uid());

-- messages: visibili e inseribili solo dai membri della conversazione.
-- Il destinatario può marcare come letto (false -> true). Niente delete.
drop policy if exists "messages_select_member"      on public.messages;
drop policy if exists "messages_insert_member"     on public.messages;
drop policy if exists "messages_update_read_recipient" on public.messages;

create policy "messages_select_member" on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_id = auth.uid() or c.mentor_id = auth.uid())
    )
  );

create policy "messages_insert_member" on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_id = auth.uid() or c.mentor_id = auth.uid())
        and c.status = 'active'
    )
  );

-- Il destinatario può aggiornare solo da read=false a read=true
create policy "messages_update_read_recipient" on public.messages
  for update to authenticated
  using (
    read = false
    and sender_id <> auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_id = auth.uid() or c.mentor_id = auth.uid())
    )
  )
  with check (read = true);

-- 17. REALTIME: pubblica messaggi e conversazioni
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end$$;

-- ============================================================
-- RATING MENTORE
-- ============================================================

-- 18. Colonna per segnalare un mentore a revisione
alter table public.mentors
  add column if not exists flagged_for_review boolean not null default false;

-- 19. MENTOR_RATINGS (visibili solo agli admin, mai agli utenti né ai mentori)
create table if not exists public.mentor_ratings (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  feedback text check (feedback is null or char_length(feedback) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists mentor_ratings_mentor_idx
  on public.mentor_ratings (mentor_id, created_at desc);

-- RLS: nessuna policy → tabella invisibile ai client. Solo service_role la legge/scrive,
-- e gli inserimenti dei rating avvengono via RPC SECURITY DEFINER (close_conversation).
alter table public.mentor_ratings enable row level security;

-- 20. TRIGGER: dopo ogni nuovo rating, se il mentore ha >= 3 valutazioni
--     e la media < 3, lo segna come da revisionare.
create or replace function public.recompute_mentor_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_rating numeric;
  total int;
begin
  select avg(rating)::numeric, count(*)
    into avg_rating, total
  from public.mentor_ratings
  where mentor_id = new.mentor_id;

  -- Soglia: almeno 3 valutazioni per evitare flag prematuri da un singolo rating basso.
  if total >= 3 and avg_rating < 3 then
    update public.profiles
       set is_flagged = true
     where id = new.mentor_id;
    -- mantieni anche la colonna legacy in sync
    update public.mentors
       set flagged_for_review = true
     where user_id = new.mentor_id;
  end if;
  return new;
end;
$$;

drop trigger if exists mentor_ratings_after_insert on public.mentor_ratings;
create trigger mentor_ratings_after_insert
  after insert on public.mentor_ratings
  for each row execute function public.recompute_mentor_flag();

-- 21. RPC: chiude la conversazione dell'utente loggato, registra rating + feedback
create or replace function public.close_conversation(p_rating int, p_feedback text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  conv_id uuid;
  conv_mentor uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'invalid rating';
  end if;

  select id, mentor_id into conv_id, conv_mentor
  from public.conversations
  where user_id = uid;

  if conv_id is null then
    raise exception 'no conversation';
  end if;

  insert into public.mentor_ratings (conversation_id, user_id, mentor_id, rating, feedback)
  values (conv_id, uid, conv_mentor, p_rating, nullif(trim(p_feedback), ''));

  delete from public.conversations where id = conv_id;
end;
$$;

-- (legacy: la funzione (int, text) sarà sostituita dalla nuova firma nella sezione v2 sotto)

-- ============================================================
-- v2: status conversazione, is_flagged sul profilo, ruolo admin
-- ============================================================

-- 22. Estendi il check del ruolo per ammettere 'admin'
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user','mentor','admin'));

-- 23. Flag visibile a livello di profilo (segnalazione automatica del mentore)
alter table public.profiles
  add column if not exists is_flagged boolean not null default false;

-- 24. Solo UNA conversazione ATTIVA per utente: il vecchio unique(user_id)
--     viene sostituito da un partial unique index (la colonna status è già
--     stata aggiunta nella sezione 10).
alter table public.conversations drop constraint if exists conversations_user_id_key;
create unique index if not exists conversations_one_active_per_user
  on public.conversations (user_id) where status = 'active';

-- 25. Mentor ratings: niente doppi rating della stessa conversazione dallo stesso utente
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'mentor_ratings_unique_user_conv'
  ) then
    alter table public.mentor_ratings
      add constraint mentor_ratings_unique_user_conv unique (conversation_id, user_id);
  end if;
end $$;

-- 26. Drop di TUTTE le firme esistenti di close_conversation prima di ricrearla
do $$
declare r record;
begin
  for r in
    select 'drop function if exists ' || ns.nspname || '.' || p.proname
           || '(' || pg_get_function_identity_arguments(p.oid) || ')' as cmd
      from pg_proc p
      join pg_namespace ns on ns.oid = p.pronamespace
     where ns.nspname = 'public' and p.proname = 'close_conversation'
  loop
    execute r.cmd;
  end loop;
end $$;

-- 27. close_conversation: marca la conversazione come 'closed'. Funziona per
--     utente e per mentore. Decrementa active_users_count se era attiva.
create or replace function public.close_conversation(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  conv_user uuid;
  conv_mentor uuid;
  conv_status text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select user_id, mentor_id, status
    into conv_user, conv_mentor, conv_status
  from public.conversations
  where id = p_conversation_id;

  if conv_user is null then
    raise exception 'conversation not found';
  end if;

  if uid <> conv_user and uid <> conv_mentor then
    raise exception 'forbidden';
  end if;

  if conv_status = 'closed' then
    return; -- idempotente
  end if;

  update public.conversations
     set status = 'closed'
   where id = p_conversation_id;

  update public.mentors
     set active_users_count = greatest(active_users_count - 1, 0)
   where user_id = conv_mentor;
end;
$$;

revoke all on function public.close_conversation(uuid) from public;
grant execute on function public.close_conversation(uuid) to authenticated;

-- 28. submit_rating: l'utente registra il rating della sua conversazione chiusa
create or replace function public.submit_rating(
  p_conversation_id uuid,
  p_rating int,
  p_feedback text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  conv_user uuid;
  conv_mentor uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'invalid rating';
  end if;

  select user_id, mentor_id
    into conv_user, conv_mentor
  from public.conversations
  where id = p_conversation_id;

  if conv_user is null then
    raise exception 'conversation not found';
  end if;
  if conv_user <> uid then
    raise exception 'only the user can rate';
  end if;

  insert into public.mentor_ratings (conversation_id, user_id, mentor_id, rating, feedback)
  values (p_conversation_id, uid, conv_mentor, p_rating, nullif(trim(p_feedback), ''));
end;
$$;

revoke all on function public.submit_rating(uuid, int, text) from public;
grant execute on function public.submit_rating(uuid, int, text) to authenticated;

-- 29. has_rated_conversation: per nascondere la schermata di rating se già fatta
create or replace function public.has_rated_conversation(p_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.mentor_ratings
     where conversation_id = p_conversation_id
       and user_id = auth.uid()
  );
$$;

revoke all on function public.has_rated_conversation(uuid) from public;
grant execute on function public.has_rated_conversation(uuid) to authenticated;

-- 30. admin_mentors_overview: panoramica per la dashboard admin
create or replace function public.admin_mentors_overview()
returns table (
  user_id uuid,
  nickname text,
  is_flagged boolean,
  avg_rating numeric,
  ratings_count int,
  conversations_count int,
  is_available boolean,
  active_users_count int
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'forbidden';
  end if;

  return query
  select
    p.id,
    p.nickname,
    p.is_flagged,
    coalesce(round(avg(r.rating)::numeric, 2), 0)::numeric,
    coalesce(count(distinct r.id)::int, 0),
    coalesce(count(distinct c.id)::int, 0),
    m.is_available,
    m.active_users_count
  from public.profiles p
  join public.mentors m on m.user_id = p.id
  left join public.mentor_ratings r on r.mentor_id = p.id
  left join public.conversations c on c.mentor_id = p.id
  where p.role = 'mentor'
  group by p.id, p.nickname, p.is_flagged, m.is_available, m.active_users_count
  order by p.is_flagged desc, p.nickname asc;
end;
$$;

revoke all on function public.admin_mentors_overview() from public;
grant execute on function public.admin_mentors_overview() to authenticated;

-- 30a. Testo di presentazione del mentore (modificabile dalla dashboard).
alter table public.mentors
  add column if not exists intro_text text not null default
    'Sono qui perché qualcuno c''è stato per me quando ne avevo bisogno. Adesso voglio fare lo stesso.';
alter table public.mentors drop constraint if exists mentors_intro_text_length;
alter table public.mentors
  add constraint mentors_intro_text_length check (char_length(intro_text) <= 500);

-- 30a-bis. RPC: profilo pubblico del mentore assegnato all'utente loggato.
--          Usata dalla preview card prima di entrare in chat.
create or replace function public.get_assigned_mentor_profile()
returns table (
  mentor_id uuid,
  nickname text,
  intro_text text,
  completed_conversations int,
  avg_rating numeric,
  ratings_count int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  mid uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select c.mentor_id into mid
    from public.conversations c
   where c.user_id = uid and c.status = 'active';

  if mid is null then
    return;
  end if;

  return query
  select
    mid,
    p.nickname,
    m.intro_text,
    coalesce(
      (select count(*)::int from public.conversations
        where mentor_id = mid and status = 'closed'),
      0
    ),
    coalesce(
      (select round(avg(rating)::numeric, 2) from public.mentor_ratings
        where mentor_id = mid),
      0
    )::numeric,
    coalesce(
      (select count(*)::int from public.mentor_ratings
        where mentor_id = mid),
      0
    )
  from public.profiles p
  join public.mentors m on m.user_id = p.id
  where p.id = mid;
end;
$$;

revoke all on function public.get_assigned_mentor_profile() from public;
grant execute on function public.get_assigned_mentor_profile() to authenticated;

-- 30b. Il mentore può leggere le valutazioni ricevute (solo le proprie).
--      Resta invisibile a tutti gli altri utenti.
drop policy if exists "mentor_ratings_select_self" on public.mentor_ratings;
create policy "mentor_ratings_select_self" on public.mentor_ratings
  for select to authenticated
  using (mentor_id = auth.uid());

-- 31. admin_clear_flag: l'admin rimuove il flag dopo una revisione
create or replace function public.admin_clear_flag(p_mentor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'forbidden';
  end if;

  update public.profiles set is_flagged = false where id = p_mentor_id;
  update public.mentors set flagged_for_review = false where user_id = p_mentor_id;
end;
$$;

revoke all on function public.admin_clear_flag(uuid) from public;
grant execute on function public.admin_clear_flag(uuid) to authenticated;

-- ============================================================
-- DOMANDE & STORIE (sezione Spazi)
-- ============================================================

-- 32. QUESTIONS — domande aperte della community per spazio tematico
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  space_slug text not null references public.spaces(slug),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists questions_space_idx
  on public.questions (space_slug, created_at desc);

-- 33. QUESTION_REPLIES — thread di risposte a una domanda
create table if not exists public.question_replies (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists question_replies_question_idx
  on public.question_replies (question_id, created_at asc);

-- 34. STORIES — post lunghi (no limite caratteri)
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  space_slug text not null references public.spaces(slug),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text check (title is null or char_length(title) <= 200),
  content text not null check (char_length(content) >= 1),
  created_at timestamptz not null default now()
);

create index if not exists stories_space_idx
  on public.stories (space_slug, created_at desc);

-- 35. STORY_REACTIONS — "anch'io" sulle storie
create table if not exists public.story_reactions (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create index if not exists story_reactions_story_idx
  on public.story_reactions (story_id);

-- 36. RLS — solo utenti autenticati leggono/scrivono; ognuno modifica solo i propri
alter table public.questions         enable row level security;
alter table public.question_replies  enable row level security;
alter table public.stories           enable row level security;
alter table public.story_reactions   enable row level security;

drop policy if exists "questions_select_all"  on public.questions;
drop policy if exists "questions_insert_self" on public.questions;
drop policy if exists "questions_delete_self" on public.questions;
create policy "questions_select_all"  on public.questions for select to authenticated using (true);
create policy "questions_insert_self" on public.questions for insert to authenticated with check (auth.uid() = author_id);
create policy "questions_delete_self" on public.questions for delete to authenticated using (auth.uid() = author_id);

drop policy if exists "question_replies_select_all"  on public.question_replies;
drop policy if exists "question_replies_insert_self" on public.question_replies;
drop policy if exists "question_replies_delete_self" on public.question_replies;
create policy "question_replies_select_all"  on public.question_replies for select to authenticated using (true);
create policy "question_replies_insert_self" on public.question_replies for insert to authenticated with check (auth.uid() = author_id);
create policy "question_replies_delete_self" on public.question_replies for delete to authenticated using (auth.uid() = author_id);

drop policy if exists "stories_select_all"  on public.stories;
drop policy if exists "stories_insert_self" on public.stories;
drop policy if exists "stories_delete_self" on public.stories;
create policy "stories_select_all"  on public.stories for select to authenticated using (true);
create policy "stories_insert_self" on public.stories for insert to authenticated with check (auth.uid() = author_id);
create policy "stories_delete_self" on public.stories for delete to authenticated using (auth.uid() = author_id);

drop policy if exists "story_reactions_select_all"  on public.story_reactions;
drop policy if exists "story_reactions_insert_self" on public.story_reactions;
drop policy if exists "story_reactions_delete_self" on public.story_reactions;
create policy "story_reactions_select_all"  on public.story_reactions for select to authenticated using (true);
create policy "story_reactions_insert_self" on public.story_reactions for insert to authenticated with check (auth.uid() = user_id);
create policy "story_reactions_delete_self" on public.story_reactions for delete to authenticated using (auth.uid() = user_id);

-- ============================================================
-- FEEDBACK BETA
-- ============================================================

-- 37. FEEDBACKS — feedback degli utenti per la beta
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('bug','idea','message')),
  content text not null check (char_length(content) between 1 and 2000),
  current_page text,
  created_at timestamptz not null default now()
);

create index if not exists feedbacks_created_at_idx
  on public.feedbacks (created_at desc);
create index if not exists feedbacks_type_idx
  on public.feedbacks (type, created_at desc);

-- 38. RLS — insert per chiunque autenticato; select solo per admin
alter table public.feedbacks enable row level security;

drop policy if exists "feedbacks_insert_authenticated" on public.feedbacks;
drop policy if exists "feedbacks_select_admin"         on public.feedbacks;

create policy "feedbacks_insert_authenticated" on public.feedbacks
  for insert to authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "feedbacks_select_admin" on public.feedbacks
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- v3: cancellazione account, statistiche profilo
-- ============================================================

-- 39. Cambia il FK conversations.mentor_id da RESTRICT a CASCADE,
--     così la cancellazione account di un mentore non viene bloccata
--     dalle sue conversazioni.
alter table public.conversations
  drop constraint if exists conversations_mentor_id_fkey;
alter table public.conversations
  add constraint conversations_mentor_id_fkey
  foreign key (mentor_id) references public.mentors(user_id)
  on delete cascade;

-- 40. RPC delete_account: l'utente loggato elimina il proprio account.
--     Cascata pulisce profilo + post + domande + storie + messaggi + ratings.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;

-- 41. RPC get_user_stats: conteggi per la pagina profilo
create or replace function public.get_user_stats(p_user_id uuid)
returns table (
  posts_count int,
  questions_count int,
  stories_count int,
  reactions_received int
)
language sql
security invoker
set search_path = public
as $$
  select
    coalesce((select count(*)::int from public.posts     where author_id = p_user_id), 0) as posts_count,
    coalesce((select count(*)::int from public.questions where author_id = p_user_id), 0) as questions_count,
    coalesce((select count(*)::int from public.stories   where author_id = p_user_id), 0) as stories_count,
    coalesce(
      (select count(*)::int from public.me_too
        where post_id in (select id from public.posts where author_id = p_user_id)),
      0
    )
    + coalesce(
      (select count(*)::int from public.story_reactions
        where story_id in (select id from public.stories where author_id = p_user_id)),
      0
    ) as reactions_received;
$$;

revoke all on function public.get_user_stats(uuid) from public;
grant execute on function public.get_user_stats(uuid) to authenticated;
