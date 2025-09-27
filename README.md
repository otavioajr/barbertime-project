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

## Notificações push

### Gerando chaves VAPID

Execute `npm run gen:vapid` sempre que precisar de um novo par de chaves. O comando imprimirá `VITE_VAPID_PUBLIC_KEY` (uso no frontend) e `VAPID_PRIVATE_KEY` (manter no Supabase/edge functions). Não commite chaves reais no repositório.

## Estrutura inicial

- `src/app` – roteamento, layouts e páginas públicas/admin.
- `src/components` – componentes compartilhados (placeholder).
- `src/features` – módulos de domínio (`booking`, `admin`, `availability`, `notifications`).
- `src/lib` – utilidades, tipos e integração com Supabase.
- `src/styles/global.css` – tema base usando Tailwind + tokens shadcn/ui.
- `src/workers/service-worker.ts` – service worker placeholder para notificações push.

## Status atual

- Vite + React + TypeScript configurados com Tailwind, shadcn/ui tokens e alias `@/`.
- Router completo (landing, fluxo de agendamento, página do token e painel admin) com layouts dedicados.
- Fluxo de agendamento integrado ao Supabase: serviços, disponibilidade (edge `get-availability`) e criação via `create-appointment`.
- Edge functions para disponibilidade, criação, lembrete e cancelamento de agendamentos compartilhando utilitários.
- Painel admin com autenticação magic link, CRUD de serviços/horários/férias e gerenciamento de agendamentos (filtros + ações).

## Próximos passos

1. Conectar histórico de agendamentos ao painel admin (listagem/ações completadas) consumindo Supabase em tempo real.
2. Instrumentar notificações push reais nas edge functions e automatizar lembretes periódicos.
3. Criar seeds/scripts para provisionar dados demo (`npm run supabase:seed`).
4. Configurar pipeline CI (lint, typecheck, vitest, validação de migrations).
5. Adicionar testes de integração para hooks/admin e suíte dedicada às edge functions.

Mais detalhes e requisitos completos estão registrados em `projeto.md`.
