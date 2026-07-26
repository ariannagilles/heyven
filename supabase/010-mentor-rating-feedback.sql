-- 010: feedback privato + submit_rating / submit_rating_feedback separati
-- Eseguire solo se 009 era già stato applicato con la versione precedente (voto+feedback insieme).
-- Se 009 non è ancora stato eseguito, usare 009 aggiornato al posto di questo file.

alter table public.mentor_ratings
  add column if not exists feedback text
  check (feedback is null or char_length(feedback) <= 1000);

create or replace function public.submit_rating(
  p_conversation_id uuid,
  p_rating int
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

create or replace function public.submit_rating_feedback(
  p_conversation_id uuid,
  p_feedback text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  conv_user uuid;
  trimmed text := nullif(trim(p_feedback), '');
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if trimmed is null then
    raise exception 'feedback is empty';
  end if;
  if char_length(trimmed) > 1000 then
    raise exception 'feedback too long';
  end if;

  select user_id into conv_user
  from public.conversations
  where id = p_conversation_id;

  if conv_user is null then
    raise exception 'conversation not found';
  end if;
  if conv_user <> uid then
    raise exception 'only the user can submit feedback';
  end if;

  update public.mentor_ratings
  set feedback = trimmed
  where conversation_id = p_conversation_id
    and rater_user_id = uid;

  if not found then
    raise exception 'rating not found';
  end if;
end;
$$;

revoke all on function public.submit_rating(uuid, int) from public;
grant execute on function public.submit_rating(uuid, int) to authenticated;

revoke all on function public.submit_rating_feedback(uuid, text) from public;
grant execute on function public.submit_rating_feedback(uuid, text) to authenticated;

-- Rimuovi overload legacy submit_rating(uuid, int, text) se presente.
drop function if exists public.submit_rating(uuid, int, text);
