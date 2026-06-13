-- =====================================================================
--  Esquema do banco de dados — Site de medição de Fibromialgia (ACR 2016)
--  Execute este script no SQL Editor do seu projeto Supabase.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Perfis de paciente (1 linha por usuário autenticado)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  cpf text,
  birth_date date,
  phone text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Avaliações (cada preenchimento do questionário ACR 2016)
-- ---------------------------------------------------------------------
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  -- Respostas completas (JSON) para auditoria/reprocessamento
  answers jsonb not null,

  -- Resultados calculados (também guardados para consulta rápida)
  wpi smallint not null,
  sss smallint not null,
  regions_with_pain smallint not null,
  severity_score smallint not null,   -- FS = WPI + SSS
  meets_criteria boolean not null
);

create index if not exists assessments_user_id_idx on public.assessments (user_id);
create index if not exists assessments_created_at_idx on public.assessments (created_at desc);

-- ---------------------------------------------------------------------
-- 3. Função utilitária: identifica administradores (médicos)
--    Os emails são guardados na tabela admin_emails.
-- ---------------------------------------------------------------------
create table if not exists public.admin_emails (
  email text primary key
);

-- >>> IMPORTANTE: insira aqui o(s) email(s) do(s) médico(s) <<<
insert into public.admin_emails (email)
values ('eldochaves@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.admin_emails enable row level security;

-- PROFILES -----------------------------------------------------------
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin (médico) pode editar os dados de qualquer paciente
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ASSESSMENTS --------------------------------------------------------
drop policy if exists "assessments_select_own_or_admin" on public.assessments;
create policy "assessments_select_own_or_admin"
  on public.assessments for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "assessments_insert_own" on public.assessments;
create policy "assessments_insert_own"
  on public.assessments for insert
  with check (auth.uid() = user_id);

-- Admin (médico) pode apagar avaliações
drop policy if exists "assessments_delete_admin" on public.assessments;
create policy "assessments_delete_admin"
  on public.assessments for delete
  using (public.is_admin());

-- ADMIN_EMAILS: por padrão ninguém lê via API. Liberamos a leitura apenas
-- para administradores, para o app conseguir excluir os médicos da lista
-- de pacientes.
drop policy if exists "admin_emails_select_admin" on public.admin_emails;
create policy "admin_emails_select_admin"
  on public.admin_emails for select
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. Trigger: cria automaticamente um profile ao criar usuário
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
