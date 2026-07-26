-- ============================================================
-- CONTENT EDIT: edited_at, UPDATE policies, column protection
-- Esegui in Supabase SQL Editor
-- ============================================================

-- 1. Colonna edited_at (null alla creazione; valorizzata solo se c'è già interazione)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'updated_at'
  ) then
    alter table public.posts rename column updated_at to edited_at;
  else
    alter table public.posts add column if not exists edited_at timestamptz;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'updated_at'
  ) then
    alter table public.questions rename column updated_at to edited_at;
  else
    alter table public.questions add column if not exists edited_at timestamptz;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stories' and column_name = 'updated_at'
  ) then
    alter table public.stories rename column updated_at to edited_at;
  else
    alter table public.stories add column if not exists edited_at timestamptz;
  end if;
end $$;

-- Pulizia: edited_at solo dove c'è almeno una interazione
update public.posts p
set edited_at = null
where edited_at is not null
  and not exists (select 1 from public.replies r where r.post_id = p.id)
  and not exists (select 1 from public.me_too m where m.post_id = p.id);

update public.questions q
set edited_at = null
where edited_at is not null
  and not exists (select 1 from public.question_replies qr where qr.question_id = q.id);

update public.stories s
set edited_at = null
where edited_at is not null
  and not exists (select 1 from public.story_reactions sr where sr.story_id = s.id);

-- 2. Policy UPDATE (solo autore)
drop policy if exists "posts_update_self" on public.posts;
create policy "posts_update_self" on public.posts
  for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "questions_update_self" on public.questions;
create policy "questions_update_self" on public.questions
  for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "stories_update_self" on public.stories;
create policy "stories_update_self" on public.stories
  for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- 3. Rimuovi trigger che impostava edited_at/updated_at a ogni UPDATE (ora gestito dal client)
drop trigger if exists posts_set_updated_at on public.posts;
drop trigger if exists questions_set_updated_at on public.questions;
drop trigger if exists stories_set_updated_at on public.stories;
drop function if exists public.set_content_updated_at();

-- 4. Trigger BEFORE UPDATE: blocca modifiche a colonne non editabili.
--    Consentite dal client: content, title (stories), at_risk, edited_at.
create or replace function public.protect_content_columns_on_update()
returns trigger
language plpgsql
as $$
begin
  if new.author_id is distinct from old.author_id then
    raise exception 'cannot modify author_id';
  end if;
  if new.space_slug is distinct from old.space_slug then
    raise exception 'cannot modify space_slug';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'cannot modify created_at';
  end if;
  return new;
end;
$$;

drop trigger if exists posts_protect_columns on public.posts;
create trigger posts_protect_columns
  before update on public.posts
  for each row execute function public.protect_content_columns_on_update();

drop trigger if exists questions_protect_columns on public.questions;
create trigger questions_protect_columns
  before update on public.questions
  for each row execute function public.protect_content_columns_on_update();

drop trigger if exists stories_protect_columns on public.stories;
create trigger stories_protect_columns
  before update on public.stories
  for each row execute function public.protect_content_columns_on_update();
