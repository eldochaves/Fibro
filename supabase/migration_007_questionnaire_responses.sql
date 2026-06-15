-- =====================================================================
--  Migração 007 — Respostas genéricas de questionários
--  Tabela única para os novos questionários (ex.: FIQR). O ACR 2016
--  continua na tabela `assessments`.
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql.)
-- =====================================================================

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

-- Paciente vê as próprias; médico vê todas
drop policy if exists "qr_select_own_or_admin" on public.questionnaire_responses;
create policy "qr_select_own_or_admin"
  on public.questionnaire_responses for select
  using (auth.uid() = user_id or public.is_admin());

-- Paciente só insere se aquele questionário estiver liberado no seu perfil
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

-- Médico pode apagar; paciente pode apagar as próprias
drop policy if exists "qr_delete_own_or_admin" on public.questionnaire_responses;
create policy "qr_delete_own_or_admin"
  on public.questionnaire_responses for delete
  using (auth.uid() = user_id or public.is_admin());
