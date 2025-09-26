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
- Router com todas as rotas descritas em `projeto.md` (landing, fluxo de agendamento, página do token e painel admin) utilizando layouts específicos.
- Providers globais com TanStack Query + Devtools.
- Utilitários iniciais (`cn`) e modelo base de tipos de domínio.
- Supabase client e validação de variáveis de ambiente preparados.

## Próximos passos

1. Implementar componentes UI (shadcn) e formulários (`ServiceCard`, `CalendarGrid`, `PhoneInput`, etc.).
2. Modelar schemas Zod e integração real com Supabase (migrations, RLS, edge functions `create-appointment`, `send-reminder`, `cancel-appointment`).
3. Construir lógica de disponibilidade, incluindo geração de slots com `date-fns-tz`.
4. Implementar autenticação de admin (Supabase Auth) e proteção de rotas.
5. Instrumentar notificações push (service worker, subscriptions, camada de abstração).
6. Adicionar testes (Vitest + React Testing Library) para regras críticas de disponibilidade.

Mais detalhes e requisitos completos estão registrados em `projeto.md`.
