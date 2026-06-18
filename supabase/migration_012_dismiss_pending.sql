-- =====================================================================
--  Migração 012 — Dispensar pendência por questionário
--  Mapa { questionnaire_key: ISO_timestamp } de quando o médico dispensou
--  a pendência (silencia até surgir novo motivo).
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql.)
-- =====================================================================

alter table public.profiles
  add column if not exists questionnaire_dismissed jsonb not null default '{}';
