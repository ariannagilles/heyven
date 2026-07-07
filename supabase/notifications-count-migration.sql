-- ============================================================
-- NOTIFICHE — migrazione: colonna count + me_too modello Instagram
-- Esegui in Supabase SQL Editor (dopo notifications.sql base)
--
-- Modello: UNA sola notifica me_too per target nel tempo.
-- Ogni nuovo anch'io aggiorna la stessa riga (anche se già letta):
-- count++, actor_id e created_at aggiornati, read=false.
-- Le reply restano una riga per ogni risposta (count=1).
-- ============================================================

-- 1. Colonna count
alter table public.notifications
  add column if not exists count integer not null default 1
  check (count >= 1);

comment on column public.notifications.count is
  'me_too: totale anch''io aggregati sulla riga. reply: sempre 1.';

-- 2. Consolida eventuali duplicati me_too (se ne esistono già più di uno per target)
create temp table if not exists _me_too_keep on commit drop as
select distinct on (recipient_id, target_type, target_id)
  id as keep_id,
  recipient_id,
  target_type,
  target_id
from public.notifications
where type = 'me_too'
order by recipient_id, target_type, target_id, created_at desc;

update public.notifications n
   set count = agg.total_count,
       read = not agg.any_unread
  from (
    select
      k.keep_id,
      sum(n2.count) as total_count,
      bool_or(not n2.read) as any_unread
    from _me_too_keep k
    join public.notifications n2
      on n2.recipient_id = k.recipient_id
     and n2.target_type = k.target_type
     and n2.target_id = k.target_id
     and n2.type = 'me_too'
    group by k.keep_id
  ) agg
 where n.id = agg.keep_id;

delete from public.notifications n
 using _me_too_keep k
 where n.type = 'me_too'
   and n.recipient_id = k.recipient_id
   and n.target_type = k.target_type
   and n.target_id = k.target_id
   and n.id <> k.keep_id;

drop index if exists notifications_me_too_unread_target_idx;

-- Una sola riga me_too per (recipient, target_type, target_id)
create unique index if not exists notifications_me_too_one_per_target_idx
  on public.notifications (recipient_id, target_type, target_id)
  where type = 'me_too';

-- 3. Insert reply (sempre nuova riga, count=1)
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
    reply_id,
    count
  ) values (
    p_recipient_id,
    p_actor_id,
    p_type,
    p_target_type,
    p_target_id,
    p_reply_id,
    1
  );
end;
$$;

revoke all on function public.create_notification(uuid, uuid, text, text, uuid, uuid) from public;

-- 4. Upsert me_too — INSERT … ON CONFLICT (race-safe con indice univoco parziale)
create or replace function public.upsert_me_too_notification(
  p_recipient_id uuid,
  p_actor_id uuid,
  p_target_type text,
  p_target_id uuid
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
    reply_id,
    count
  ) values (
    p_recipient_id,
    p_actor_id,
    'me_too',
    p_target_type,
    p_target_id,
    null,
    1
  )
  on conflict (recipient_id, target_type, target_id) where (type = 'me_too')
  do update set
    count = public.notifications.count + 1,
    actor_id = excluded.actor_id,
    created_at = now(),
    read = false;
end;
$$;

revoke all on function public.upsert_me_too_notification(uuid, uuid, text, uuid) from public;

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

  perform public.upsert_me_too_notification(
    v_author_id,
    new.user_id,
    'post',
    new.post_id
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

  perform public.upsert_me_too_notification(
    v_author_id,
    new.user_id,
    'story',
    new.story_id
  );

  return new;
end;
$$;

drop trigger if exists story_reactions_notify_author on public.story_reactions;
create trigger story_reactions_notify_author
  after insert on public.story_reactions
  for each row execute function public.notify_story_reaction();

-- 7. RPC — numero di notifiche non lette (badge Navbar: una riga = 1)
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
