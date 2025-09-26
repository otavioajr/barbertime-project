-- Additional indexes & constraints for BarberTime
set check_function_bodies = off;

-- Improve lookup performance for customer-centric queries
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'appointments'
      and indexname = 'appointments_customer_phone_idx'
  ) then
    execute 'create index appointments_customer_phone_idx on public.appointments (customer_phone)';
  end if;
end;
$$;

-- Avoid duplicate subscriptions for the same phone/token pair
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'push_subscriptions_public_token_phone_key'
  ) then
    execute 'alter table public.push_subscriptions add constraint push_subscriptions_public_token_phone_key unique (public_token, customer_phone)';
  end if;
end;
$$;

-- Speed up vacation overlap checks
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'vacations'
      and indexname = 'vacations_range_idx'
  ) then
    execute 'create index vacations_range_idx on public.vacations (starts_on, ends_on)';
  end if;
end;
$$;

-- Ensure work hour windows do not collapse
alter table public.work_hours
  add constraint work_hours_start_before_end check (start_time < end_time);

