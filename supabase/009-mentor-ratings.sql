-- 009: mentor_ratings — raccolta anonima + riepilogo pubblico (media/conteggio)
-- Eseguire manualmente nel SQL Editor di Supabase dopo revisione.
-- NON eseguire automaticamente da questo repo.

create table if not exists public.mentor_ratings (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  rater_user_id uuid not null references public.profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz not null default now()
);

-- Allinea colonne legacy (user_id / rating) se la tabella esisteva già.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'mentor_ratings'
      and column_name = 'user_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'mentor_ratings'
      and column_name = 'rater_user_id'
  ) then
    alter table public.mentor_ratings rename column user_id to rater_user_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'mentor_ratings'
      and column_name = 'rating'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'mentor_ratings'
      and column_name = 'stars'
  ) then
    alter table public.mentor_ratings rename column rating to stars;
  end if;
end $$;

alter table public.mentor_ratings drop constraint if exists mentor_ratings_unique_user_conv;
alter table public.mentor_ratings drop constraint if exists mentor_ratings_unique_rater_conv;
alter table public.mentor_ratings
  add constraint mentor_ratings_unique_rater_conv
  unique (conversation_id, rater_user_id);

create index if not exists mentor_ratings_mentor_idx
  on public.mentor_ratings (mentor_id, created_at desc);

alter table public.mentor_ratings enable row level security;

-- Nessuna policy SELECT/INSERT/UPDATE/DELETE: accesso solo via RPC security definer.
drop policy if exists "mentor_ratings_select_self" on public.mentor_ratings;
drop policy if exists "mentor_ratings_insert_own" on public.mentor_ratings;

revoke all on table public.mentor_ratings from anon, authenticated;

-- Inserimento solo via RPC; l'RPC verifica che l'utente sia il titolare della conversazione.
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
  conv_status text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'invalid rating';
  end if;

  select user_id, mentor_id, status
    into conv_user, conv_mentor, conv_status
  from public.conversations
  where id = p_conversation_id;

  if conv_user is null then
    raise exception 'conversation not found';
  end if;
  if conv_user <> uid then
    raise exception 'only the user can rate';
  end if;
  if conv_status is distinct from 'closed' then
    raise exception 'conversation must be closed before rating';
  end if;

  insert into public.mentor_ratings (
    conversation_id,
    rater_user_id,
    mentor_id,
    stars
  )
  values (p_conversation_id, uid, conv_mentor, p_rating)
  on conflict (conversation_id, rater_user_id) do nothing;
end;
$$;

create or replace function public.has_rated_conversation(p_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.mentor_ratings
    where conversation_id = p_conversation_id
      and rater_user_id = auth.uid()
  );
$$;

-- Solo media arrotondata (1 decimale) e conteggio: nessun voto singolo esposto.
create or replace function public.get_mentor_rating_summary(p_mentor_id uuid)
returns table (avg_stars numeric, rating_count int)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(round(avg(stars)::numeric, 1), 0)::numeric as avg_stars,
    count(*)::int as rating_count
  from public.mentor_ratings
  where mentor_id = p_mentor_id;
$$;

revoke all on function public.submit_rating(uuid, int, text) from public;
grant execute on function public.submit_rating(uuid, int, text) to authenticated;

revoke all on function public.has_rated_conversation(uuid) from public;
grant execute on function public.has_rated_conversation(uuid) to authenticated;

revoke all on function public.get_mentor_rating_summary(uuid) from public;
grant execute on function public.get_mentor_rating_summary(uuid) to authenticated;
