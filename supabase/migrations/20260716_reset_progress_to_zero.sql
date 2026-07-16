-- 1) Fix seed for future signups (start from zero)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company, telegram, progress, xp, level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Ученик'),
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'telegram',
    0,
    0,
    'Builder'
  )
  on conflict (id) do nothing;

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

-- 2) Confirm emails (safe — no confirmed_at)
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email_confirmed_at is null;

-- 3) Reset progress to zero
update public.profiles
set progress = 0, xp = 0, level = 'Builder', updated_at = now();

delete from public.checklist_items;
delete from public.homework_submissions;

update public.stage_progress set status = 'locked', progress = 0, updated_at = now();
update public.stage_progress set status = 'active', progress = 0, updated_at = now()
where stage_id = '1';

insert into public.stage_progress (user_id, stage_id, status, progress)
select u.id, s.stage_id,
  case when s.stage_id = '1' then 'active' else 'locked' end,
  0
from auth.users u
cross join (values ('1'),('2'),('3'),('4'),('5'),('6'),('7'),('8')) as s(stage_id)
on conflict (user_id, stage_id) do nothing;
