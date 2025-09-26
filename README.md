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
- Router com todas as rotas descritas em `projeto.md` utilizando layouts dedicados.
- Fluxo de agendamento integrado ao Supabase (serviços, disponibilidade via edge function e criação de agendamento).
- Edge functions `get-availability`, `create-appointment`, `send-reminder` e `cancel-appointment` com utilitários compartilhados.
- Painel admin com autenticação magic link e CRUD para serviços, horários de trabalho e férias/fechamentos.

## Próximos passos

1. Conectar histórico de agendamentos ao painel admin (listar/cancelar/confirmar) consumindo Supabase.
2. Instrumentar notificações push reais nas edge functions e adicionar rotina agendada de lembretes.
3. Criar testes de integração para hooks/admin e suíte das edge functions (Vitest/Deno).
4. Adicionar seeds/scripts para provisionar dados demo (`npm run supabase:seed`).
5. Configurar pipeline CI (lint, typecheck, vitest, verificação de migrations).

Mais detalhes e requisitos completos estão registrados em `projeto.md`.
