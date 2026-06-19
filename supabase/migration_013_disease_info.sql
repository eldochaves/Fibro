-- =====================================================================
--  Migração 013 — Conteúdo educativo por doença (editável pelo médico)
--  Resumo + links oficiais por doença, exibidos na área do paciente (/saude).
--  Se não houver linha para a doença, o app usa o texto padrão do código.
--  Execute no SQL Editor do Supabase. (Já incluído no schema.sql.)
-- =====================================================================

create table if not exists public.disease_info (
  disease_key text primary key,
  summary text,
  resources jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.disease_info enable row level security;

-- Leitura liberada (conteúdo educativo, sem dados sensíveis)
drop policy if exists "disease_info_read" on public.disease_info;
create policy "disease_info_read"
  on public.disease_info for select
  using (true);

-- Escrita apenas para o médico (admin)
drop policy if exists "disease_info_admin" on public.disease_info;
create policy "disease_info_admin"
  on public.disease_info for all
  using (public.is_admin())
  with check (public.is_admin());
