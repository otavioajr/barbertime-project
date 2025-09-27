-- Seed data for BarberTime local development

insert into public.services (id, name, duration_min, price_cents, active)
values
  ('11111111-1111-1111-1111-111111111111', 'Corte clássico', 30, 4500, true),
  ('22222222-2222-2222-2222-222222222222', 'Corte + Barba', 60, 8500, true),
  ('33333333-3333-3333-3333-333333333333', 'Barba detalhada', 45, 5500, true)
on conflict (id) do update
set name = excluded.name,
    duration_min = excluded.duration_min,
    price_cents = excluded.price_cents,
    active = excluded.active;

insert into public.work_hours (weekday, start_time, end_time, active)
values
  (1, '09:00', '12:00', true),
  (1, '13:30', '18:00', true),
  (2, '09:00', '18:00', true),
  (3, '09:00', '12:00', true),
  (4, '09:00', '18:00', true),
  (5, '09:00', '19:00', true)
on conflict (weekday, start_time, end_time) do update
set active = excluded.active;

insert into public.vacations (starts_on, ends_on, reason)
values
  (date_trunc('day', now())::date + interval '10 day', date_trunc('day', now())::date + interval '12 day', 'Feriado prolongado')
  on conflict do nothing;

-- example admin profile (replace email when syncing with auth)
insert into public.profiles (id, is_admin)
select id, true
from auth.users
where email = 'admin@barbertime.app'
  and not exists (select 1 from public.profiles where public.profiles.id = auth.users.id);
