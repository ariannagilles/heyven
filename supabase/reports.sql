-- ============================================================
-- REPORTS — segnalazione contenuti
-- Esegui in Supabase SQL Editor (tabella public.reports già presente)
-- ============================================================

-- Indice utile per la coda admin
create index if not exists reports_pending_idx
  on public.reports (reviewed, created_at desc)
  where reviewed = false;

-- RLS: insert per utenti autenticati; select solo admin
alter table public.reports enable row level security;

drop policy if exists "reports_insert_authenticated" on public.reports;
drop policy if exists "reports_select_admin"         on public.reports;

create policy "reports_insert_authenticated" on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

create policy "reports_select_admin" on public.reports
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles
       where id = auth.uid() and role = 'admin'
    )
  );

-- RPC: solo admin possono segnare una segnalazione come revisionata
create or replace function public.admin_mark_report_reviewed(p_report_id uuid)
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

  update public.reports
     set reviewed = true
   where id = p_report_id
     and reviewed = false;

  if not found then
    raise exception 'report not found or already reviewed';
  end if;
end;
$$;

revoke all on function public.admin_mark_report_reviewed(uuid) from public;
grant execute on function public.admin_mark_report_reviewed(uuid) to authenticated;
