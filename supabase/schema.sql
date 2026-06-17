-- Ejecutar en Supabase SQL Editor.
-- Activa UUIDs para generar ids desde Postgres si se necesita.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  plate text,
  odometer integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mileage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  record_date date not null,
  value integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.maintenance_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  type text not null,
  interval_km integer not null,
  priority text not null default 'Media',
  next_mileage integer not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  record_date date not null,
  type text not null,
  mileage integer not null,
  next_mileage integer,
  cost integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.mileage_records enable row level security;
alter table public.maintenance_plans enable row level security;
alter table public.maintenance_records enable row level security;

create policy "profiles own rows" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "vehicles own rows" on public.vehicles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "mileage own rows" on public.mileage_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "plans own rows" on public.maintenance_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "records own rows" on public.maintenance_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
