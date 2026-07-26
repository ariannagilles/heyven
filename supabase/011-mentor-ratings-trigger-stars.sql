-- 011: allinea trigger e RPC legacy che usavano la colonna rating → stars
-- Eseguire nel SQL Editor se submit_rating fallisce con "column rating does not exist"
-- dopo l'inserimento (trigger recompute_mentor_flag non aggiornato).

create or replace function public.recompute_mentor_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_stars numeric;
  total int;
begin
  select avg(stars)::numeric, count(*)
    into avg_stars, total
  from public.mentor_ratings
  where mentor_id = new.mentor_id;

  if total >= 3 and avg_stars < 3 then
    update public.profiles
       set is_flagged = true
     where id = new.mentor_id;
    update public.mentors
       set flagged_for_review = true
     where user_id = new.mentor_id;
  end if;
  return new;
end;
$$;

-- Rimuovi overload submit_rating(uuid, int, text) se ancora presente.
drop function if exists public.submit_rating(uuid, int, text);
