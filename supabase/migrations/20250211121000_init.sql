-- BarberTime initial schema
set check_function_bodies = off;

create extension if not exists "pgcrypto" with schema public;

-- Utility function to check admin flag quickly
create or replace function public.is_admin(user_id uuid)
  returns boolean
  language sql
  stable
as
$$
  select coalesce((
    select p.is_admin
    from public.profiles as p
    where p.id = user_id
  ), false)
$$;

-- Profiles table mirrors auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

-- Services offered by the barbershop
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_min integer not null check (duration_min > 0),
  price_cents integer,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists services_name_key on public.services(lower(name));
create index if not exists services_active_idx on public.services(active);

-- Work hours per weekday
create table if not exists public.work_hours (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists work_hours_weekday_idx on public.work_hours(weekday);

-- Vacation / closure ranges
create table if not exists public.vacations (
  id uuid primary key default gen_random_uuid(),
  starts_on date not null,
  ends_on date not null,
  reason text,
  created_at timestamptz not null default timezone('utc', now()),
  check (starts_on <= ends_on)
);

-- Appointment status enum
create type public.appointment_status as enum ('scheduled', 'confirmed', 'canceled', 'completed');

-- Appointments controlled via edge functions
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  customer_name text,
  customer_phone text not null,
  status public.appointment_status not null default 'scheduled',
  public_token text not null unique default public.next_public_token(),
  reminder_sent boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  check (starts_at < ends_at)
);

create index if not exists appointments_starts_at_idx on public.appointments(starts_at);
create index if not exists appointments_service_idx on public.appointments(service_id);

-- Push subscriptions for web push
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  public_token text references public.appointments(public_token) on delete cascade,
  customer_phone text,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (endpoint, auth)
);

-- Trigger to automatically create profile row when auth user registers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as
$$
begin
  insert into public.profiles(id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.work_hours enable row level security;
alter table public.vacations enable row level security;
alter table public.appointments enable row level security;
alter table public.push_subscriptions enable row level security;

-- Profiles policies
create policy "Profiles can be viewed by admins or self" on public.profiles
  for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Profiles are manageable by admins" on public.profiles
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Services policies
create policy "Services are readable by anyone" on public.services
  for select using (true);

create policy "Admins manage services" on public.services
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Work hours policies
create policy "Work hours are readable by anyone" on public.work_hours
  for select using (true);

create policy "Admins manage work hours" on public.work_hours
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Vacations policies
create policy "Vacations are readable by anyone" on public.vacations
  for select using (true);

create policy "Admins manage vacations" on public.vacations
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Appointments policies
create policy "Admins can view appointments" on public.appointments
  for select
  using (public.is_admin(auth.uid()));

create policy "Admins can manage appointments" on public.appointments
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Allow service role to manage appointments" on public.appointments
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

create policy "Public token can read appointment" on public.appointments
  for select
  using (
    (auth.jwt() ->> 'role' = 'service_role')
    or (public.is_admin(auth.uid()))
    or (
      auth.jwt() ? 'public_token'
      and public_token = auth.jwt() ->> 'public_token'
    )
  );

-- Push subscriptions policies
create policy "Push subscriptions are readable by admins" on public.push_subscriptions
  for select
  using (public.is_admin(auth.uid()) or auth.jwt() ->> 'role' = 'service_role');

create policy "Allow anyone to save push subscription" on public.push_subscriptions
  for insert
  with check (true);

create policy "Allow service role to delete push subscription" on public.push_subscriptions
  for delete
  using (auth.jwt() ->> 'role' = 'service_role' or public.is_admin(auth.uid()));

-- Helpers for public token generation
create or replace function public.generate_public_token()
  returns text
  language sql
  volatile
as
$$
  select encode(gen_random_bytes(12), 'base64')
$$;

create or replace function public.next_public_token()
  returns text
  language plpgsql
  volatile
as
$$
declare
  new_token text;
begin
  loop
    new_token := replace(replace(replace(public.generate_public_token(), '+', ''), '/', ''), '=', '');
    exit when not exists (select 1 from public.appointments where public_token = new_token);
  end loop;
  return new_token;
end;
$$;
