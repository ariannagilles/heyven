-- 012: onboarding_completed nei custom claims (app_metadata)
-- Così il middleware legge user.app_metadata senza query su profiles.
-- Eseguire manualmente nel SQL Editor di Supabase dopo revisione.
-- NON eseguire automaticamente da questo repo.

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Copia il flag nei custom claims (merge, non sovrascrive provider/providers)
create or replace function public.sync_onboarding_claim()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('onboarding_completed', new.onboarding_completed)
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists profiles_sync_onboarding_claim on public.profiles;
create trigger profiles_sync_onboarding_claim
  after insert or update of onboarding_completed
  on public.profiles
  for each row
  execute function public.sync_onboarding_claim();

-- Chiamata dal client a fine wizard. Aggiorna profiles;
-- il trigger scrive il claim.
create or replace function public.complete_onboarding()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  update public.profiles
  set onboarding_completed = true
  where id = auth.uid();
end;
$$;

revoke all on function public.complete_onboarding() from public;
grant execute on function public.complete_onboarding() to authenticated;

-- Backfill euristico: in produzione il wizard non ha mai scritto il flag.
-- Chi ha già finito gli step ha birth_date e almeno uno spazio.
-- Il trigger sincronizza app_metadata su queste righe.
update public.profiles
set onboarding_completed = true
where onboarding_completed = false
  and birth_date is not null
  and preferred_spaces is not null
  and cardinality(preferred_spaces) > 0;

-- Rete di sicurezza: allinea i claim anche se il trigger non è partito.
update auth.users u
set raw_app_meta_data =
  coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('onboarding_completed', true)
where exists (
  select 1
  from public.profiles p
  where p.id = u.id
    and p.onboarding_completed = true
);
