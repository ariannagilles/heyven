-- Data di nascita e città sul profilo (registrazione step1b)
alter table public.profiles
  add column if not exists birth_date date;

alter table public.profiles
  add column if not exists city text;
