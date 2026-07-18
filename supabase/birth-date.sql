-- Data di nascita sul profilo (registrazione step1)
alter table public.profiles
  add column if not exists birth_date date;
