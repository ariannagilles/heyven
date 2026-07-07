-- ============================================================
-- NOTIFICHE IN-APP
-- Esegui in Supabase SQL Editor
-- ============================================================

-- 1. TABELLA
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('reply', 'me_too')),
  target_type text not null check (target_type in ('post', 'question', 'story')),
  target_id uuid not null,
  reply_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on column public.notifications.reply_id is
  'ID della risposta che ha generato la notifica (replies.id o question_replies.id). Senza FK per evitare ambiguità tra tabelle.';

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

create index if not exists notifications_recipient_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read = false;

-- 2. FUNZIONE HELPER (insert centralizzato)
create or replace function public.create_notification(
  p_recipient_id uuid,
  p_actor_id uuid,
  p_type text,
  p_target_type text,
  p_target_id uuid,
  p_reply_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_recipient_id is null
     or p_actor_id is null
     or p_recipient_id = p_actor_id then
    return;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    target_type,
    target_id,
    reply_id
  ) values (
    p_recipient_id,
    p_actor_id,
    p_type,
    p_target_type,
    p_target_id,
    p_reply_id
  );
end;
$$;

revoke all on function public.create_notification(uuid, uuid, text, text, uuid, uuid) from public;

-- 3. TRIGGER — risposta a un post (sfogo)
create or replace function public.notify_post_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_id uuid;
begin
  select author_id into v_author_id
    from public.posts
   where id = new.post_id;

  perform public.create_notification(
    v_author_id,
    new.author_id,
    'reply',
    'post',
    new.post_id,
    new.id
  );

  return new;
end;
$$;

drop trigger if exists replies_notify_author on public.replies;
create trigger replies_notify_author
  after insert on public.replies
  for each row execute function public.notify_post_reply();

-- 4. TRIGGER — risposta a una domanda
create or replace function public.notify_question_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_id uuid;
begin
  select author_id into v_author_id
    from public.questions
   where id = new.question_id;

  perform public.create_notification(
    v_author_id,
    new.author_id,
    'reply',
    'question',
    new.question_id,
    new.id
  );

  return new;
end;
$$;

drop trigger if exists question_replies_notify_author on public.question_replies;
create trigger question_replies_notify_author
  after insert on public.question_replies
  for each row execute function public.notify_question_reply();

-- 5. TRIGGER — anch'io su un post
create or replace function public.notify_post_me_too()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_id uuid;
begin
  select author_id into v_author_id
    from public.posts
   where id = new.post_id;

  perform public.create_notification(
    v_author_id,
    new.user_id,
    'me_too',
    'post',
    new.post_id,
    null
  );

  return new;
end;
$$;

drop trigger if exists me_too_notify_author on public.me_too;
create trigger me_too_notify_author
  after insert on public.me_too
  for each row execute function public.notify_post_me_too();

-- 6. TRIGGER — anch'io su una storia
create or replace function public.notify_story_reaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_id uuid;
begin
  select author_id into v_author_id
    from public.stories
   where id = new.story_id;

  perform public.create_notification(
    v_author_id,
    new.user_id,
    'me_too',
    'story',
    new.story_id,
    null
  );

  return new;
end;
$$;

drop trigger if exists story_reactions_notify_author on public.story_reactions;
create trigger story_reactions_notify_author
  after insert on public.story_reactions
  for each row execute function public.notify_story_reaction();

-- 7. PULIZIA — elimina notifiche orfane se il contenuto viene cancellato
create or replace function public.delete_post_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.notifications
   where target_type = 'post' and target_id = old.id;
  return old;
end;
$$;

create or replace function public.delete_question_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.notifications
   where target_type = 'question' and target_id = old.id;
  return old;
end;
$$;

create or replace function public.delete_story_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.notifications
   where target_type = 'story' and target_id = old.id;
  return old;
end;
$$;

drop trigger if exists posts_delete_notifications on public.posts;
create trigger posts_delete_notifications
  after delete on public.posts
  for each row execute function public.delete_post_notifications();

drop trigger if exists questions_delete_notifications on public.questions;
create trigger questions_delete_notifications
  after delete on public.questions
  for each row execute function public.delete_question_notifications();

drop trigger if exists stories_delete_notifications on public.stories;
create trigger stories_delete_notifications
  after delete on public.stories
  for each row execute function public.delete_story_notifications();

-- 8. RLS
alter table public.notifications enable row level security;

revoke insert, update, delete on public.notifications from authenticated;
grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

drop policy if exists "notifications_select_self" on public.notifications;
drop policy if exists "notifications_update_read_self" on public.notifications;

create policy "notifications_select_self" on public.notifications
  for select to authenticated
  using (recipient_id = auth.uid());

create policy "notifications_update_read_self" on public.notifications
  for update to authenticated
  using (recipient_id = auth.uid() and read = false)
  with check (recipient_id = auth.uid() and read = true);

-- 9. RPC — conteggio non lette (Navbar)
create or replace function public.get_unread_notifications_count()
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::integer
    from public.notifications
   where recipient_id = auth.uid()
     and read = false;
$$;

revoke all on function public.get_unread_notifications_count() from public;
grant execute on function public.get_unread_notifications_count() to authenticated;
