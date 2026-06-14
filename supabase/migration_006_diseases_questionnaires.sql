-- =====================================================================
--  Migração 006 — Doenças e questionários atribuídos pelo médico
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql para
--  instalações novas.)
-- =====================================================================

-- Etiquetas de doença do paciente (ex.: {'fibromialgia','gota'})
alter table public.profiles
  add column if not exists diseases text[] not null default '{}';

-- Questionários que o paciente pode responder (ex.: {'acr2016'})
alter table public.profiles
  add column if not exists questionnaires text[] not null default '{}';
