-- =====================================================================
--  Migração 005 — Foto de perfil (avatar) + Storage
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql para
--  instalações novas.)
-- =====================================================================

-- 1. Coluna com a URL pública da foto de perfil
alter table public.profiles
  add column if not exists avatar_url text;

-- 2. Bucket público de avatares
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 3. Políticas do Storage:
--    - leitura pública (bucket é público)
--    - cada usuário só escreve na sua própria pasta (nome = uid)
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_user_insert" on storage.objects;
create policy "avatars_user_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_user_delete" on storage.objects;
create policy "avatars_user_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
