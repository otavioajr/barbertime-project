
Aqui está um prompt pronto para você colar em uma IA geradora de código e ela criar todo o projeto:

```
Quero que você gere um projeto completo em React + TypeScript para um sistema de agendamento de horários de uma barbearia, usando Supabase (auth, banco de dados, RLS, edge functions e realtime quando fizer sentido). O foco é qualidade de código, boas práticas de UI/UX e DX.

## Objetivo
- Permitir que clientes agendem horários sem precisar criar conta, mas **obrigatoriamente informando telefone** (formato E.164, com validação e máscara).
- Enviar **notificação push** (Web Push) para o cliente após o agendamento e lembrete próximo ao horário. Preparar arquitetura para futuramente enviar via WhatsApp ou SMS (apenas camadas de abstração e webhooks; não precisa integrar com provedores agora).
- Incluir **Painel Admin** para configurar: dias da semana de funcionamento, faixas de horário de trabalho, serviços oferecidos (“produtos”: corte, corte+barba, barba etc.), duração/preço por serviço, e **períodos de férias/fechamento** (datas nas quais não pode haver agendamentos).

## Tech/Stack
- React + TypeScript + Vite.
- UI: Tailwind CSS + shadcn/ui (ou Radix UI) + ícones (lucide-react).
- Formulários: react-hook-form + zod (validação).
- Estado: TanStack Query para dados do Supabase.
- Roteamento: React Router.
- Datas/horários: date-fns-tz (timezone configurável; padrão America/Sao_Paulo).
- Notificações push: service worker + Web Push (gera chaves VAPID no build dev e suporte a env em prod).
- Supabase: Postgres, Policies (RLS), Auth (e-mail mágico opcional para admin; cliente sem conta), Storage (opcional para assets), Edge Functions para disparo de push/rotinas.

## Requisitos de UX
- Fluxo do cliente em 3 passos: (1) escolher serviço → (2) escolher data/horário disponível → (3) informar nome opcional e **telefone obrigatório** + aceitar termos → confirmar.
- Mostre claramente horários indisponíveis/ocupados/desabilitados (férias/fora do expediente).
- Feedback imediato (toasts) e estados de carregamento/erro.
- Acessibilidade (semântica, foco, contraste, teclado) e responsividade mobile-first.
- PWA: manifest + service worker para permitir receber push e “Adicionar à tela inicial”.

## Requisitos de Domínio
- Um serviço tem: nome, duração (min), preço (opcional), ativo/inativo.
- Configuração de trabalho: por dia da semana defina janelas (ex.: 09:00–12:00, 13:30–19:00). Permitir múltiplas faixas por dia.
- **Férias/fechamentos**: intervalos de datas (start_date, end_date) onde **nenhum** agendamento pode ser criado.
- Agendamento: referência ao serviço, data/hora de início, data/hora de fim derivada (início + duração), telefone do cliente, status (scheduled, confirmed, canceled, completed), lembretes/enviados, consentimento de notificações.
- Impedir colisões: não permitir dois agendamentos que se sobreponham.
- Limitar antecedência mínima/máxima configurável (ex.: não permitir agendar passado, nem além de 60 dias).

## Segurança e Regras (Supabase RLS)
Crie tabelas e policies:
- `profiles` (admin flag).
- `services` (apenas admin CRUD; leitura pública).
- `work_hours` (configuração semanal; admin CRUD; leitura pública).
- `vacations` (fechamentos; admin CRUD; leitura pública).
- `appointments` (criação pública porém validada via edge function; leitura: apenas admin e pelo hash público do próprio agendamento retornado no sucesso; update/cancelamento via token/hash único).
- `push_subscriptions` (associa hash do agendamento ou telefone a endpoint de push; write público, read restrito).

**Importante:** criação de agendamento deve ser feita por **Edge Function** para validar:
1) horário dentro de uma janela ativa de trabalho,
2) não colide com outro agendamento,
3) não cai em férias/fechamentos,
4) telefone válido,
5) gera um `public_token` (UUID curto) para o cliente poder consultar/cancelar sem conta.

## Modelagem (DDL sugerida)
- `services(id, name, duration_min, price_cents, active, created_at)`
- `work_hours(id, weekday INT 0-6, start_time TIME, end_time TIME, active, created_at)`
- `vacations(id, starts_on DATE, ends_on DATE, reason TEXT, created_at)`
- `appointments(id, service_id FK, starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ, customer_name TEXT, customer_phone TEXT, status TEXT, public_token TEXT UNIQUE, created_at)`
- `push_subscriptions(id, public_token FK NULL, customer_phone TEXT NULL, endpoint TEXT, p256dh TEXT, auth TEXT, created_at)`
- `profiles(id UUID PK -> auth.users, is_admin BOOL, created_at)`

Crie índices úteis em `appointments(starts_at)`, `appointments(public_token)`, `services(active)`.

## Rotas e Páginas
- `/` – Landing simples com CTA “Agendar”.
- `/agendar` – Passo 1 (serviços) → Passo 2 (disponibilidade por calendário/grade) → Passo 3 (dados + consentimento + ativar push).
- `/agendamento/:token` – página de sucesso/gestão do agendamento (ver, cancelar).
- `/admin/login` – login admin (Supabase).
- `/admin` (layout protegido) com:
  - `/admin/dashboard` – visão de próximos agendamentos e métricas básicas.
  - `/admin/services` – CRUD de serviços.
  - `/admin/schedule` – configuração de dias/horários (work_hours).
  - `/admin/vacations` – CRUD de férias/fechamentos.
  - `/admin/appointments` – lista/filtrar/cancelar/confirmar.

## Lógica de Disponibilidade
- Gere “slots” a partir das janelas de `work_hours` considerando `duration_min` do serviço escolhido.
- Exclua slots que:
  - estejam dentro de `vacations` (inclusive limites),
  - colidam com `appointments` existentes (status scheduled/confirmed),
  - fiquem fora de restrições (antecedência, janelas, minutos de intervalo opcional).
- Mostre a grade por dia/semana, com paginação por datas.

## Notificações Push (Mínimo Viável)
- Ao finalizar um agendamento:
  - salvar subscription (se permitido),
  - disparar push de confirmação via Edge Function (título, serviço, data/hora, link `/agendamento/:token`).
- Crie tarefa/endpoint para enviar lembrete (ex.: 2h antes). Pode ser chamado manualmente (cron externo) — apenas estrutura pronta.

## Componentes Principais
- `ServiceCard`, `ServiceList`
- `CalendarGrid` (grade de horários com estados: livre, ocupado, desabilitado)
- `PhoneInput` (máscara + validação E.164; exibir DDI Brasil por padrão)
- `ConsentCheckbox` (termos e push)
- `Toast/AlertDialog`
- Admin: `CrudTable`, `TimeRangeEditor`, `VacationRangePicker`, `SlotPreview`

## Boas Práticas de Código
- Estrutura de pastas:
```

src/

app/ (rotas/páginas)

components/

features/

booking/

admin/

notifications/

availability/

lib/ (supabase, date, validators)

hooks/

styles/

workers/ (service worker)

```
- Tipos compartilhados em `src/lib/types.ts`.
- Zod schemas para inputs (agendamentos, serviços, horários).
- TanStack Query + chaves de cache previsíveis.
- .env.example com SUPABASE_URL, SUPABASE_ANON_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.
- Scripts npm: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `gen:vapid` (gera chaves).
- Testes básicos (Vitest + React Testing Library) em lógica de disponibilidade.

## Edge Functions (Supabase)
1) `create-appointment` (POST): valida regras, cria registro e retorna `public_token`. Dispara push de confirmação se houver subscription.
2) `send-reminder` (POST): recebe `appointment_id` ou intervalo temporal e dispara push para agendamentos próximos.
3) `cancel-appointment` (POST): via `public_token` altera status para `canceled` (com checks de prazo).

## Políticas RLS (resumo)
- `services`, `work_hours`, `vacations`: SELECT para `anon` e `authenticated`; INSERT/UPDATE/DELETE apenas `is_admin = true`.
- `appointments`: INSERT via RPC/edge function com `security definer`; SELECT restrito por `public_token` (cliente) ou `is_admin`; UPDATE cancelamento via função com `public_token`.
- `push_subscriptions`: INSERT público; SELECT apenas admin.

## Critérios de Aceite
- Não é possível criar agendamento em período de férias/fechamento.
- Não é possível criar agendamento que colida com outro.
- Cliente consegue concluir agendamento sem conta, com telefone válido, e recebe push (se aceito).
- Admin consegue configurar serviços, horários e férias.
- UI responsiva e acessível.
- Build roda com `npm i && npm run dev` com instruções claras no README.

## Entregáveis
- Repositório com código completo, README com setup (Supabase migrations + seeds), instruções para gerar chaves VAPID, e como registrar o service worker.
- Scripts SQL de criação de tabelas e policies.
- Exemplos de `.rest`/`http` (ou Insomnia/Thunder Client) para testar as Edge Functions.

Implemente tudo acima com qualidade de produção, comentários essenciais e foco em simplicidade e clareza.
```

Quer que eu adapte o prompt para Next.js (App Router) ou manter em Vite mesmo?
