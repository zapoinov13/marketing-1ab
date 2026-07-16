-- AI Marketing Lab — core schema
-- Project: codefxnhkhorpwutnxdp
-- Run in Supabase SQL Editor if MCP unavailable

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  company text,
  phone text,
  telegram text,
  level text not null default 'Builder',
  xp integer not null default 0,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mission Control stage progress
create table if not exists public.stage_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stage_id text not null,
  status text not null default 'todo'
    check (status in ('todo', 'active', 'done', 'locked')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  updated_at timestamptz not null default now(),
  unique (user_id, stage_id)
);

-- Checklist per stage
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stage_id text not null,
  item_key text not null,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, stage_id, item_key)
);

-- Homework submissions
create table if not exists public.homework_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id text not null,
  status text not null default 'active'
    check (status in ('active', 'done', 'overdue')),
  answer text,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);

create index if not exists stage_progress_user_idx on public.stage_progress (user_id);
create index if not exists checklist_items_user_idx on public.checklist_items (user_id);
create index if not exists homework_submissions_user_idx on public.homework_submissions (user_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists stage_progress_set_updated_at on public.stage_progress;
create trigger stage_progress_set_updated_at
  before update on public.stage_progress
  for each row execute function public.set_updated_at();

drop trigger if exists checklist_items_set_updated_at on public.checklist_items;
create trigger checklist_items_set_updated_at
  before update on public.checklist_items
  for each row execute function public.set_updated_at();

drop trigger if exists homework_submissions_set_updated_at on public.homework_submissions;
create trigger homework_submissions_set_updated_at
  before update on public.homework_submissions
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company, telegram)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Ученик'),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'telegram'
  )
  on conflict (id) do nothing;

  -- Seed mission stages 1–8
  insert into public.stage_progress (user_id, stage_id, status, progress)
  values
    (new.id, '1', 'done', 100),
    (new.id, '2', 'done', 100),
    (new.id, '3', 'active', 45),
    (new.id, '4', 'todo', 0),
    (new.id, '5', 'locked', 0),
    (new.id, '6', 'locked', 0),
    (new.id, '7', 'locked', 0),
    (new.id, '8', 'locked', 0)
  on conflict (user_id, stage_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.stage_progress enable row level security;
alter table public.checklist_items enable row level security;
alter table public.homework_submissions enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Stage progress
drop policy if exists "stage_progress_all_own" on public.stage_progress;
create policy "stage_progress_all_own" on public.stage_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Checklist
drop policy if exists "checklist_all_own" on public.checklist_items;
create policy "checklist_all_own" on public.checklist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Homework
drop policy if exists "homework_all_own" on public.homework_submissions;
create policy "homework_all_own" on public.homework_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
