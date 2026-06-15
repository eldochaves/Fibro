-- =====================================================================
--  Migração 008 — Frequência de disponibilidade por questionário
--  Mapa { questionnaire_key: "always" | "yearly" | "quarterly4" | "once" }
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql.)
-- =====================================================================

alter table public.profiles
  add column if not exists questionnaire_freq jsonb not null default '{}';
