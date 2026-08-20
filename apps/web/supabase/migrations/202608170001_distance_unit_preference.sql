alter table public.profiles
  drop constraint if exists profiles_preferred_unit_check;

update public.profiles
set preferred_unit = case
  when preferred_unit = 'imperial' then 'mi'
  else 'km'
end;

alter table public.profiles
  alter column preferred_unit set default 'km';

alter table public.profiles
  add constraint profiles_preferred_unit_check
  check (preferred_unit in ('km', 'mi'));
