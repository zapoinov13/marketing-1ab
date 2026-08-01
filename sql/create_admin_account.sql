-- Создание аккаунта администратора
-- Логин: zapoinov@bk.ru   Пароль: zapoinov@bk.ru
-- Запусти этот скрипт в Supabase → SQL Editor (проект codefxnhkhorpwutnxdp)

create extension if not exists pgcrypto;

do $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = 'zapoinov@bk.ru';

  if v_id is null then
    v_id := gen_random_uuid();

    insert into auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    )
    values (
      v_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'zapoinov@bk.ru',
      crypt('zapoinov@bk.ru', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin"}'::jsonb,
      now(), now()
    );

    insert into auth.identities (
      id, user_id, provider, provider_id, identity_data, created_at, updated_at, last_sign_in_at
    )
    values (
      gen_random_uuid(), v_id, 'email', v_id::text,
      json_build_object('sub', v_id::text, 'email', 'zapoinov@bk.ru', 'email_verified', true)::jsonb,
      now(), now(), now()
    );
  else
    -- аккаунт уже есть: обновляем пароль и подтверждаем email
    update auth.users
    set encrypted_password = crypt('zapoinov@bk.ru', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        updated_at = now()
    where id = v_id;
  end if;

  -- профиль + права администратора
  insert into public.profiles (id, full_name, email, level, xp, progress, is_admin, is_blocked, is_removed)
  values (v_id, 'Admin', 'zapoinov@bk.ru', 'Builder', 0, 0, true, false, false)
  on conflict (id) do update
    set is_admin = true,
        is_blocked = false,
        is_removed = false,
        email = 'zapoinov@bk.ru',
        updated_at = now();
end $$;
