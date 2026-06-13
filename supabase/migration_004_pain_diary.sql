-- =====================================================================
--  Migração 004 — Diário de Dor
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql para
--  instalações novas.)
-- =====================================================================

-- 1. Sinalizador no perfil: o médico habilita o diário por paciente
alter table public.profiles
  add column if not exists pain_diary_enabled boolean not null default false;

-- 2. Episódios de dor (cada linha = um episódio registrado pelo paciente)
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

-- Paciente vê os próprios; médico vê todos
drop policy if exists "pain_select_own_or_admin" on public.pain_episodes;
create policy "pain_select_own_or_admin"
  on public.pain_episodes for select
  using (auth.uid() = user_id or public.is_admin());

-- Paciente só pode inserir se o diário estiver habilitado no seu perfil
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

-- Paciente pode editar/apagar os próprios; médico pode apagar qualquer
drop policy if exists "pain_update_own" on public.pain_episodes;
create policy "pain_update_own"
  on public.pain_episodes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "pain_delete_own_or_admin" on public.pain_episodes;
create policy "pain_delete_own_or_admin"
  on public.pain_episodes for delete
  using (auth.uid() = user_id or public.is_admin());
