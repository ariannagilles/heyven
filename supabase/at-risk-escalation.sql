-- ============================================================
-- AT-RISK CONTENT + MENTOR ESCALATION
-- Esegui in Supabase SQL Editor
-- ============================================================

-- 1. Flag at_risk sui tre tipi di contenuto
alter table public.posts
  add column if not exists at_risk boolean not null default false;

alter table public.questions
  add column if not exists at_risk boolean not null default false;

alter table public.stories
  add column if not exists at_risk boolean not null default false;

create index if not exists posts_at_risk_idx
  on public.posts (at_risk, created_at desc)
  where at_risk = true;

create index if not exists questions_at_risk_idx
  on public.questions (at_risk, created_at desc)
  where at_risk = true;

create index if not exists stories_at_risk_idx
  on public.stories (at_risk, created_at desc)
  where at_risk = true;

-- 2. Escalation conversazioni mentore
alter table public.conversations
  add column if not exists escalated boolean not null default false;

alter table public.conversations
  add column if not exists escalated_at timestamptz;

-- 3. Estendi target_type reports (se esiste un check constraint)
alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports
  add constraint reports_target_type_check check (
    target_type in (
      'post',
      'reply',
      'question',
      'question_reply',
      'story',
      'message',
      'conversation'
    )
  );

-- 4. RPC: mentore segnala conversazione alla supervisione
create or replace function public.mentor_escalate_conversation(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mentor_id uuid;
begin
  select mentor_id into v_mentor_id
    from public.conversations
   where id = p_conversation_id;

  if v_mentor_id is null then
    raise exception 'conversation not found';
  end if;

  if v_mentor_id <> auth.uid() then
    raise exception 'forbidden';
  end if;

  update public.conversations
     set escalated = true,
         escalated_at = now()
   where id = p_conversation_id;

  insert into public.reports (
    reporter_id,
    target_type,
    target_id,
    reason
  ) values (
    auth.uid(),
    'conversation',
    p_conversation_id,
    'Escalation supervisione mentore'
  );
end;
$$;

revoke all on function public.mentor_escalate_conversation(uuid) from public;
grant execute on function public.mentor_escalate_conversation(uuid) to authenticated;
