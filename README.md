# BarberTime

Sistema web para agendamento eletrônico de uma barbearia, construído com React, TypeScript, Vite e Supabase. O objetivo é oferecer uma experiência moderna para clientes e um painel completo para administradores configurarem serviços, horários e notificações.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` baseado em `.env.example` (ver sessão pendências) e preencha as variáveis exigidas.
3. Execute o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

Scripts úteis:

- `npm run dev` – ambiente de desenvolvimento com Vite.
- `npm run build` – build de produção (TypeScript + Vite).
- `npm run preview` – preview do build.
- `npm run lint` – ESLint com regras strict.
- `npm run typecheck` – verificação de tipos sem saída.
- `npm run format` – formata arquivos com Prettier.
- `npm run gen:vapid` – gera um novo par de chaves VAPID (public/private).
- `npm run test` – executa a suíte de testes (Vitest).
- `npm run supabase:start` – inicializa o stack local do Supabase (requer Supabase CLI).
- `npm run supabase:db:migrate` – aplica as migrations do diretório `supabase/migrations`.
- `npm run supabase:functions:serve` – sobe as edge functions localmente (carrega variáveis de `supabase/.env`).
- `npm run supabase:stop` – encerra os containers locais do Supabase.

## Notificações push

### Gerando chaves VAPID

Execute `npm run gen:vapid` sempre que precisar de um novo par de chaves. O comando imprimirá `VITE_VAPID_PUBLIC_KEY` (uso no frontend) e `VAPID_PRIVATE_KEY` (manter no Supabase/edge functions). Não commite chaves reais no repositório.

## Supabase (local)

1. Instale a [Supabase CLI](https://supabase.com/docs/guides/cli) e faça login (`supabase login`).
2. Copie `supabase/.env.example` para `supabase/.env` preenchendo `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` e `VAPID_PRIVATE_KEY` quando necessário.
3. Inicialize o stack local:
   ```bash
   npm run supabase:start
   ```
4. Rode as migrations:
   ```bash
   npm run supabase:db:migrate
   ```
5. Para desenvolver/depurar edge functions:
   ```bash
   npm run supabase:functions:serve
   ```

Ao finalizar, encerre os containers locais com `npm run supabase:stop`.

### Administradores (magic link)

- Após aplicar as migrations, cadastre o e-mail desejado na tabela `profiles` com `is_admin = true`.
- Use a página `/admin/login` para solicitar um link mágico (Supabase Auth). O link redireciona para `/admin`.
- O layout admin bloqueia acesso quando não há sessão ativa e disponibiliza botão de sair na barra superior.

## Estrutura inicial

- `src/app` – roteamento, layouts e páginas públicas/admin.
- `src/components` – componentes compartilhados (placeholder).
- `src/features` – módulos de domínio (`booking`, `admin`, `availability`, `notifications`).
- `src/lib` – utilidades, tipos e integração com Supabase.
- `src/styles/global.css` – tema base usando Tailwind + tokens shadcn/ui.
- `src/workers/service-worker.ts` – service worker placeholder para notificações push.
- `supabase/migrations` – schema SQL e políticas de RLS.
- `supabase/functions` – edge functions (`create-appointment`, `send-reminder`, `cancel-appointment`).
- `supabase/functions` – edge functions (`get-availability`, `create-appointment`, `send-reminder`, `cancel-appointment`).
- `supabase/types.ts` – tipagem gerada manualmente para o schema (compartilhada entre app e funções).
- `docs/supabase-policy-checklist.md` – roteiro rápido para validar RLS/índices em releases.

## Status atual

- Vite + React + TypeScript configurados com Tailwind, shadcn/ui tokens e alias `@/`.
- Router com todas as rotas descritas em `projeto.md` (landing, fluxo de agendamento, página do token e painel admin) utilizando layouts específicos.
- Fluxo de agendamento (3 etapas) operando com validações (Zod + react-hook-form) e componentes personalizados.
- Integração com Supabase para listar serviços, calcular disponibilidade (edge function `get-availability`) e criar agendamentos via `create-appointment`.
- Motor de disponibilidade compartilhado entre front-end e edge function, com suporte a férias, colisões, lead time e janela máxima.
- Supabase configurado: migrations com tabelas/policies e edge functions (`create-appointment`, `send-reminder`, `cancel-appointment`) com validação e integrações iniciais.

## Próximos passos

1. Integrar o front-end com o Supabase real (queries/mutações usando TanStack Query + edge functions).
2. Implementar painel admin completo (CRUDs, proteções de rota e Supabase Auth com magic link).
3. Conectar notificações push (Web Push) às funções `send-reminder`/`create-appointment` e preparar gatilhos de cron.
4. Expandir cobertura de testes (React Testing Library + Vitest) e adicionar testes end-to-end das funções.
5. Criar scripts de seed/dados de exemplo para desenvolvimento local e ajustes finos das policies.

Mais detalhes e requisitos completos estão registrados em `projeto.md`.
