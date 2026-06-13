-- =====================================================================
--  Migração 002 — Poderes do médico (admin)
--  Execute no SQL Editor do Supabase se o banco foi criado ANTES desta
--  atualização. (Já incluído no schema.sql para instalações novas.)
--
--  Adiciona:
--   - médico pode editar dados de qualquer paciente
--   - médico pode apagar avaliações
--   - médico pode ler a lista de admins (para excluir médicos da lista
--     de pacientes no painel)
-- =====================================================================

-- Médico pode editar os dados de qualquer paciente
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Médico pode apagar avaliações
drop policy if exists "assessments_delete_admin" on public.assessments;
create policy "assessments_delete_admin"
  on public.assessments for delete
  using (public.is_admin());

-- Médico pode ler a lista de admins
drop policy if exists "admin_emails_select_admin" on public.admin_emails;
create policy "admin_emails_select_admin"
  on public.admin_emails for select
  using (public.is_admin());
