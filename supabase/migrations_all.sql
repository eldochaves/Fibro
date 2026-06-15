-- =====================================================================
--  SCRIPT CONSOLIDADO — todas as migrações (002 a 007)
--  Seguro rodar mesmo que algumas já tenham sido aplicadas (idempotente).
--  Cole tudo no SQL Editor do Supabase e clique em Run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 002 — Poderes do médico (admin)
-- ---------------------------------------------------------------------
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "assessments_delete_admin" on public.assessments;
create policy "assessments_delete_admin"
  on public.assessments for delete
  using (public.is_admin());

drop policy if exists "admin_emails_select_admin" on public.admin_emails;
create policy "admin_emails_select_admin"
  on public.admin_emails for select
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 003 — CPF
-- ---------------------------------------------------------------------
alter table public.profiles add column if not exists cpf text;

-- ---------------------------------------------------------------------
-- 004 — Diário de Dor
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists pain_diary_enabled boolean not null default false;

create table if not exists public.pain_episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  episode_date date not null,
  start_time text,
  activity text,
  location text,
  eva smallint check (eva >= 0 and eva <= 10),
  radiation text,
  end_time text
);

create index if not exists pain_episodes_user_id_idx on public.pain_episodes (user_id);
create index if not exists pain_episodes_date_idx on public.pain_episodes (episode_date desc);

alter table public.pain_episodes enable row level security;

drop policy if exists "pain_select_own_or_admin" on public.pain_episodes;
create policy "pain_select_own_or_admin"
  on public.pain_episodes for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "pain_insert_own_enabled" on public.pain_episodes;
create policy "pain_insert_own_enabled"
  on public.pain_episodes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.pain_diary_enabled = true
    )
  );

drop policy if exists "pain_update_own" on public.pain_episodes;
create policy "pain_update_own"
  on public.pain_episodes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "pain_delete_own_or_admin" on public.pain_episodes;
create policy "pain_delete_own_or_admin"
  on public.pain_episodes for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------
-- 005 — Foto de perfil (avatar) + Storage
-- ---------------------------------------------------------------------
alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

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

-- ---------------------------------------------------------------------
-- 006 — Doenças e questionários atribuídos pelo médico
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists diseases text[] not null default '{}';
alter table public.profiles
  add column if not exists questionnaires text[] not null default '{}';

-- ---------------------------------------------------------------------
-- 007 — Respostas genéricas de questionários (ex.: FIQR)
-- ---------------------------------------------------------------------
create table if not exists public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  questionnaire_key text not null,
  created_at timestamptz not null default now(),
  answers jsonb not null,
  score numeric,
  summary jsonb
);

create index if not exists qr_user_idx on public.questionnaire_responses (user_id);
create index if not exists qr_key_idx on public.questionnaire_responses (questionnaire_key);
create index if not exists qr_created_idx on public.questionnaire_responses (created_at desc);

alter table public.questionnaire_responses enable row level security;

drop policy if exists "qr_select_own_or_admin" on public.questionnaire_responses;
create policy "qr_select_own_or_admin"
  on public.questionnaire_responses for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "qr_insert_own_assigned" on public.questionnaire_responses;
create policy "qr_insert_own_assigned"
  on public.questionnaire_responses for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and questionnaire_key = any (p.questionnaires)
    )
  );

drop policy if exists "qr_delete_own_or_admin" on public.questionnaire_responses;
create policy "qr_delete_own_or_admin"
  on public.questionnaire_responses for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------
-- 008 — Frequência de disponibilidade por questionário
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists questionnaire_freq jsonb not null default '{}';
