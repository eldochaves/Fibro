# Avaliação de Fibromialgia (ACR 2016)

Site para os pacientes preencherem, no celular, o questionário de fibromialgia
durante a pré-consulta. Cada paciente tem suas medidas armazenadas e o médico,
com sua conta de administrador, vê todos os pacientes.

- **Questionário:** critérios diagnósticos ACR 2016 — WPI (Índice de Dor
  Generalizada, 0–19) + SSS (Escala de Severidade dos Sintomas, 0–12).
- **Login:** Google ou cadastro por email/senha.
- **Tecnologia:** Next.js 14 (App Router) + Supabase (autenticação + banco
  PostgreSQL) + Tailwind CSS. Pronto para deploy na Vercel.

---

## 1. Pré-requisitos

- Conta gratuita no [Supabase](https://supabase.com)
- Conta gratuita na [Vercel](https://vercel.com) (para publicar) — opcional para testar localmente
- Node.js 18+ instalado (para rodar localmente)

## 2. Configurar o Supabase

1. Crie um novo projeto em https://supabase.com.
2. No menu **SQL Editor**, cole e execute todo o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql). Isso cria as tabelas,
   as regras de segurança (RLS) e o cadastro de administradores.
3. **Importante:** dentro do `schema.sql` há esta linha — troque pelo seu email
   de médico (pode adicionar vários, repetindo o `insert`):

   ```sql
   insert into public.admin_emails (email) values ('eldochaves@gmail.com')
   ```

4. Em **Settings → API**, copie:
   - `Project URL` → vai em `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Habilitar login com Google

1. No Supabase, vá em **Authentication → Providers → Google** e ative.
2. Crie credenciais OAuth no [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Tipo: *OAuth client ID* → *Web application*.
   - Em **Authorized redirect URIs**, adicione a URL que o Supabase mostra
     (algo como `https://SEU-PROJETO.supabase.co/auth/v1/callback`).
   - Copie o **Client ID** e **Client Secret** para a tela do Supabase.
3. Em **Authentication → URL Configuration**, defina o **Site URL** para o
   endereço do seu site (ex.: `http://localhost:3000` em testes ou a URL da
   Vercel em produção) e adicione `…/auth/callback` em *Redirect URLs*.

> O login por email/senha já funciona sem nenhuma configuração extra. Para
> testes, você pode desativar a confirmação de email em
> **Authentication → Sign In / Providers → Email → Confirm email**.

## 3. Rodar localmente

```bash
cp .env.local.example .env.local   # preencha com a URL e a chave do Supabase
npm install
npm run dev
```

Acesse http://localhost:3000.

## 4. Publicar na Vercel

1. Suba este repositório para o GitHub (já está na branch indicada).
2. Em https://vercel.com, importe o repositório.
3. Em **Settings → Environment Variables**, adicione
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Faça o deploy. Depois, ajuste no Supabase o **Site URL** e os
   **Redirect URLs** para a URL gerada pela Vercel.

---

## Como funciona

| Página            | Quem acessa | O que faz                                              |
| ----------------- | ----------- | ------------------------------------------------------ |
| `/`               | Todos       | Tela inicial; redireciona conforme o login.            |
| `/login`          | Todos       | Login/cadastro (Google ou email/senha).                |
| `/questionario`   | Paciente    | Responde o questionário ACR 2016 (assistente em etapas).|
| `/historico`      | Paciente    | Lista as próprias avaliações.                          |
| `/admin`          | Médico      | Lista todos os pacientes e estatísticas.               |
| `/admin/[userId]` | Médico      | Detalhe completo de um paciente.                       |

A permissão de médico é definida pela tabela `admin_emails` no banco. A
segurança é garantida por **Row Level Security**: um paciente só lê os próprios
dados; o administrador lê os de todos.

## Aviso

Esta é uma ferramenta de **triagem/apoio** baseada nos critérios ACR 2016. Não
substitui a avaliação clínica nem constitui diagnóstico.
