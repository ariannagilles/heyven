-- Verifica disponibilità nickname in registrazione (già eseguita su Supabase).
-- Usa SECURITY DEFINER: non espone la tabella profiles agli anonimi.

create or replace function public.nickname_available(p_nickname text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
      from public.profiles
     where nickname = trim(p_nickname)
  );
$$;

revoke all on function public.nickname_available(text) from public;
grant execute on function public.nickname_available(text) to anon, authenticated;
