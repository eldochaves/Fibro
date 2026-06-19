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

## Diretriz — ao sugerir/adicionar uma doença
SEMPRE que sugerir acrescentar uma doença (ou ao adicioná-la), pesquisar e
propor os **instrumentos de avaliação e critérios diagnósticos/classificatórios
relacionados**, baseados em **referências consolidadas: SBR (Sociedade
Brasileira de Reumatologia), ACR (American College of Rheumatology) e EULAR**.
Apresentar a lista para o médico escolher antes de implementar, separando
ferramentas de avaliação de critérios e indicando se cada critério é
diagnóstico ou classificatório (e o ano/autor da referência). Incluir a EVA
(0–10) para quantificar a dor quando fizer sentido. Cada doença recebe cor +
ícone em `src/lib/diseaseTheme.ts`.

## Manutenção — informações ao paciente (links das sociedades)
Os textos e links educativos por doença ficam em `src/lib/diseaseInfo.ts`
(exibidos em `/saude`). Os links apontam para materiais oficiais (SBR etc.).
**Revisar periodicamente (sugestão: a cada 6 meses)**: conferir se os links
continuam no ar e se há cartilhas novas. Como o site da SBR bloqueia acesso
automatizado (403), a verificação dos URLs precisa ser feita clicando no
navegador. Basta pedir "revisar os links de saúde" que a lista é reavaliada.

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

### Aviso ao médico por e-mail (quando houver domínio próprio)
Hoje o médico é avisado de novos envios dos pacientes (questionários e diário)
por um painel **"Novidades"** dentro de `/admin` (sino + "marcar como visto",
baseado em `profiles.admin_last_seen_at`). Não envia e-mail.

**Quando a clínica tiver domínio próprio**, implementar o **resumo por e-mail**
(o médico pediu: enviar **só se houver novidade**, em formato de **resumo**, não
um e-mail por envio). Como o destinatário é o próprio médico, isso funcionaria
até no modo de teste do Resend — mas a decisão foi deixar para quando houver
domínio, junto com as configs do Resend (ver seção do Diário acima). Ideia:
um job diário (Vercel Cron) que verifica envios das últimas 24h e, havendo
novidade, manda um e-mail-resumo com os nomes e o que cada um enviou.

### Página de depoimentos pós-infiltração (acumular antes)
O questionário **"Feedback pós-infiltração"** (`infiltracao_tend`, rota
`/infiltracao`, dentro de Tendinites) já guarda o **depoimento** em texto livre
e a **autorização** do paciente (`summary.consent` e `summary.consent_nome`:
anônimo ou com primeiro nome). Decisão do médico: **primeiro acumular respostas**
e só depois criar a página pública de depoimentos. Quando for a hora, criar uma
vitrine que exiba **apenas** os depoimentos com `consent = true` (anônimos ou,
se `consent_nome`, com o primeiro nome) — para outros pacientes verem.

### Outras ideias já levantadas (não implementadas)
- Questionário FIQR (impacto/severidade ao longo do tempo).
- Exportar pacientes/avaliações em CSV.
- Reenviar o aviso do diário sem precisar desabilitar/habilitar.
