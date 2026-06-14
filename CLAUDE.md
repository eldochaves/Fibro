# Projeto — Avaliação de Fibromialgia · Clínica Dr. Eldo Chaves

App Next.js 16 + Supabase para pacientes preencherem, na pré-consulta, o
questionário de fibromialgia (ACR 2016) e o diário de dor pelo celular. O
médico (admin) acompanha todos os pacientes.

## Stack
- Next.js 16 (App Router) + React 19 + Tailwind CSS
- Supabase (Auth Google/email + Postgres com Row Level Security)
- Deploy na Vercel; domínio atual: `fibro.vercel.app`
- Identidade da marca: azul-marinho `#083858` (`navy`) + verde-petróleo
  `#289888` (`teal`); fontes Inter + Fraunces. Logos em `public/`.

## Banco de dados
- Esquema completo em `supabase/schema.sql`; migrações incrementais em
  `supabase/migration_00X_*.sql` (rodar no SQL Editor para bancos já criados).
- Admins (médicos) ficam na tabela `admin_emails`; função `is_admin()`.

## Melhorias futuras / pendências

### Email automático do Diário de Dor (quando houver domínio próprio)
Hoje, ao habilitar o Diário de Dor, o médico avisa o paciente por **botões
manuais** de WhatsApp (`wa.me`) e e-mail (`mailto:`) — zero configuração,
funciona para qualquer paciente, sem domínio.

O **envio automático por email** via Resend já está implementado em
`src/lib/email.ts` e é acionado em `adminSetPainDiary` (`src/app/actions.ts`),
porém só liga se `RESEND_API_KEY` estiver definida. Sem domínio verificado, o
Resend só envia para o email da própria conta (remetente de teste
`onboarding@resend.dev`), por isso o envio automático está desativado na
prática.

**Quando a clínica tiver um domínio próprio**, para ligar o email automático:
1. Registrar o domínio (ex.: `clinicadreldochaves.com.br`).
2. No Resend → Domains → adicionar o domínio e configurar os registros DNS
   (SPF/DKIM) até ficar "Verified".
3. Na Vercel (Environment Variables):
   - `RESEND_API_KEY` = chave do Resend
   - `RESEND_FROM` = `Clínica Dr. Eldo <nao-responda@SEU-DOMINIO>`
   - `NEXT_PUBLIC_SITE_URL` = URL pública (ex.: `https://SEU-DOMINIO`)
4. Redeploy. O email passará a ser enviado automaticamente ao habilitar o
   diário; os botões manuais continuam como alternativa.

Aproveitar o domínio também para apontar o site (em vez de `fibro.vercel.app`).

### Outras ideias já levantadas (não implementadas)
- Questionário FIQR (impacto/severidade ao longo do tempo).
- Exportar pacientes/avaliações em CSV.
- Reenviar o aviso do diário sem precisar desabilitar/habilitar.
