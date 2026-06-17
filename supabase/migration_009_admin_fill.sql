-- =====================================================================
--  Migração 009 — Médico responde em nome do paciente
--  Permite que administradores insiram avaliações/respostas para qualquer
--  paciente (preenchimento assistido). Execute no SQL Editor do Supabase.
-- =====================================================================

drop policy if exists "assessments_insert_admin" on public.assessments;
create policy "assessments_insert_admin"
  on public.assessments for insert
  with check (public.is_admin());

drop policy if exists "qr_insert_admin" on public.questionnaire_responses;
create policy "qr_insert_admin"
  on public.questionnaire_responses for insert
  with check (public.is_admin());
