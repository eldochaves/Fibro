-- =====================================================================
--  Migração 014 — "Novidades" no painel do médico
--  Guarda quando o médico viu a atividade pela última vez, para destacar
--  envios novos de pacientes (questionários e diário de dor).
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql.)
-- =====================================================================

alter table public.profiles
  add column if not exists admin_last_seen_at timestamptz;
