-- =====================================================================
--  Migração 003 — Campo CPF no perfil do paciente
--  Execute no SQL Editor do Supabase se o banco foi criado antes desta
--  atualização. (Já incluído no schema.sql para instalações novas.)
-- =====================================================================

alter table public.profiles
  add column if not exists cpf text;
