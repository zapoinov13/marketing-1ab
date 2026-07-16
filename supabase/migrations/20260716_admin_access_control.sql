-- Admin access control: block / soft-remove students
-- Project: codefxnhkhorpwutnxdp
-- Run in Supabase → SQL Editor

alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

alter table public.profiles
  add column if not exists is_removed boolean not null default false;

alter table public.profiles
  add column if not exists email text;

-- Backfill emails from auth
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and (p.email is null or p.email = '');

-- Keep signup seed in sync (email + zero progress)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, company, telegram, email, progress, xp, level, is_blocked, is_removed
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Ученик'),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'telegram',
    new.email,
    0,
    0,
    'Builder',
    false,
    false
  )
  on conflict (id) do update
  set email = excluded.email;

  insert into public.stage_progress (user_id, stage_id, status, progress)
  values
    (new.id, '1', 'active', 0),
    (new.id, '2', 'locked', 0),
    (new.id, '3', 'locked', 0),
    (new.id, '4', 'locked', 0),
    (new.id, '5', 'locked', 0),
    (new.id, '6', 'locked', 0),
    (new.id, '7', 'locked', 0),
    (new.id, '8', 'locked', 0)
  on conflict (user_id, stage_id) do nothing;

  return new;
end;
$$;

-- Admins can update any profile (block / remove / restore)
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can write stage progress (reset)
drop policy if exists "stage_progress_write_admin" on public.stage_progress;
create policy "stage_progress_write_admin" on public.stage_progress
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "checklist_write_admin" on public.checklist_items;
create policy "checklist_write_admin" on public.checklist_items
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "homework_write_admin" on public.homework_submissions;
create policy "homework_write_admin" on public.homework_submissions
  for all
  using (public.is_admin())
  with check (public.is_admin());
