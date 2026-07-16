-- Admin panel: role flag + read-all policies for admins
-- Project: codefxnhkhorpwutnxdp
-- Run in Supabase SQL Editor

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Avoid RLS recursion when checking admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Admins can read all profiles
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select
  using (public.is_admin());

-- Admins can read all stage progress
drop policy if exists "stage_progress_select_admin" on public.stage_progress;
create policy "stage_progress_select_admin" on public.stage_progress
  for select
  using (public.is_admin());

-- Admins can read all checklist
drop policy if exists "checklist_select_admin" on public.checklist_items;
create policy "checklist_select_admin" on public.checklist_items
  for select
  using (public.is_admin());

-- Admins can read all homework submissions
drop policy if exists "homework_select_admin" on public.homework_submissions;
create policy "homework_select_admin" on public.homework_submissions
  for select
  using (public.is_admin());

-- ============================================================
-- MAKE YOURSELF ADMIN (замени email на свой):
-- update public.profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = 'your@email.com');
-- ============================================================
