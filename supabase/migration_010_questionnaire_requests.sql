-- =====================================================================
--  Migração 010 — Solicitação de nova resposta por questionário
--  Mapa { questionnaire_key: ISO_timestamp } do momento em que o médico
--  pediu uma nova resposta (reabre questionários, inclusive "apenas uma vez").
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql.)
-- =====================================================================

alter table public.profiles
  add column if not exists questionnaire_requests jsonb not null default '{}';
