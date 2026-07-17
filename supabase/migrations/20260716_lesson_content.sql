-- Lesson CMS: video, docs, links editable by admins
-- Project: codefxnhkhorpwutnxdp
-- Run in Supabase → SQL Editor

create table if not exists public.lesson_content (
  stage_id text primary key,
  title text,
  duration text,
  description text,
  about jsonb not null default '[]'::jsonb,
  video_embed_url text,
  homework text,
  documents jsonb not null default '[]'::jsonb,
  links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.lesson_content enable row level security;

drop policy if exists "lesson_content_select_all" on public.lesson_content;
create policy "lesson_content_select_all" on public.lesson_content
  for select
  to authenticated, anon
  using (true);

drop policy if exists "lesson_content_write_admin" on public.lesson_content;
create policy "lesson_content_write_admin" on public.lesson_content
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Public bucket for lesson PDFs / docs / images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lesson-docs',
  'lesson-docs',
  true,
  20971520,
  array[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/json',
    'image/png',
    'image/jpeg',
    'image/webp',
    'video/mp4'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lesson_docs_public_read" on storage.objects;
create policy "lesson_docs_public_read"
  on storage.objects for select
  using (bucket_id = 'lesson-docs');

drop policy if exists "lesson_docs_admin_upload" on storage.objects;
create policy "lesson_docs_admin_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'lesson-docs'
    and public.is_admin()
  );

drop policy if exists "lesson_docs_admin_update" on storage.objects;
create policy "lesson_docs_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'lesson-docs' and public.is_admin())
  with check (bucket_id = 'lesson-docs' and public.is_admin());

drop policy if exists "lesson_docs_admin_delete" on storage.objects;
create policy "lesson_docs_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'lesson-docs' and public.is_admin());
