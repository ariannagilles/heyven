-- 008: closed_at su conversations + aggiornamento close_conversation
-- Eseguire manualmente nel SQL Editor di Supabase dopo revisione.
-- Nota: status (active/closed) esiste già; questo aggiunge la data di chiusura.

alter table public.conversations
  add column if not exists closed_at timestamptz;

comment on column public.conversations.closed_at is
  'Timestamp di chiusura esplicita da utente o mentore; null finché active.';

create index if not exists conversations_user_closed_idx
  on public.conversations (user_id, closed_at desc nulls last)
  where status = 'closed';

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
    return;
  end if;

  update public.conversations
     set status = 'closed',
         closed_at = now()
   where id = p_conversation_id;

  update public.mentors
     set active_users_count = greatest(active_users_count - 1, 0)
   where user_id = conv_mentor;
end;
$$;

-- Dopo l'esecuzione: in lib/mentor-list.ts aggiungere closed_at al select
-- delle conversazioni chiuse per mostrare la data di chiusura corretta.
