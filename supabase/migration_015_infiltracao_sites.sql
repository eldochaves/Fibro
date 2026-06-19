-- =====================================================================
--  Migração 015 — Locais infiltrados (feedback pós-infiltração)
--  Guarda quais tendinites foram infiltradas, marcadas pelo médico ao
--  encaminhar o feedback. São registradas junto da resposta do paciente.
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql.)
-- =====================================================================

alter table public.profiles
  add column if not exists infiltracao_sites jsonb not null default '[]'::jsonb;
