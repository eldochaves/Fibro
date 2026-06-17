-- =====================================================================
--  Migração 011 — Marca respostas preenchidas pelo médico
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql.)
-- =====================================================================

alter table public.assessments
  add column if not exists by_doctor boolean not null default false;

alter table public.questionnaire_responses
  add column if not exists by_doctor boolean not null default false;
