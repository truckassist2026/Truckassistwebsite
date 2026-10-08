-- Run this only after you confirm your preferred admin-user strategy.
-- This creates a separate admin mapping without changing users.role.
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  name varchar(120),
  email varchar(255),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- IMPORTANT: Add a strict admin policy after deciding how your admin identity
-- is represented. Do not expose the service_role key in the browser.
