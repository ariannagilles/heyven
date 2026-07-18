-- ============================================================
-- CONTENT EDIT: updated_at, UPDATE policies, column protection
-- Esegui in Supabase SQL Editor
-- ============================================================

-- 1. Colonna updated_at (null alla creazione, valorizzata solo in modifica)
alter table public.posts
  add column if not exists updated_at timestamptz;

alter table public.questions
  add column if not exists updated_at timestamptz;

alter table public.stories
  add column if not exists updated_at timestamptz;

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

-- 3. Trigger BEFORE UPDATE: blocca modifiche a colonne non editabili.
--    Consentite: content, title (stories), at_risk, updated_at.
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
