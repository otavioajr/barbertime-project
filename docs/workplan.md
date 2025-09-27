# BarberTime Work Plan

## Contexto
- Foco imediato: ligar o app existente ao backend Supabase recém-criado, preparar automações essenciais e garantir que o time tenha roteiros claros de verificação.
- Horizonte de execução: próximo ciclo (1–2 semanas), podendo ser refinado conforme entregas.

## Trilha 1 · Backend & Supabase
| # | Item | Objetivo | Dependências | Critérios de pronto |
|---|------|----------|--------------|---------------------|
| B1 | Revisar migrations e RLS | Cobrir gaps de índices, validações e políticas antes da primeira liberação | Schema atual (`supabase/migrations/20250211121000_init.sql`) | ✅ `supabase/migrations/20250211160000_schema_tuning.sql` com novos índices/constraints; checklist `docs/supabase-policy-checklist.md` documentado |
| B2 | Script de seed realista | Popular tabela de serviços/horários/férias e admin padrão para acelerar onboarding | B1 | ✅ `supabase/seed.sql` + `npm run supabase:seed`, README atualizado, dados idempotentes |
| B3 | Harden edge functions | Padronizar logs, normalizar timezone/phone, adicionar rate limits simples e códigos de erro claros | B1 | ✅ Push notifications nas funções (`create-appointment`, `send-reminder`), normalização de timezone/telefone, logs extras |
| B4 | Jobs e cron | Preparar rotinas para lembretes e limpeza (tokens/subscriptions órfãs) | B3 | Manual `SUPABASE_SCHEDULE` ou script externo documentado, testes básicos de execução |

## Trilha 2 · Frontend & App
| # | Item | Objetivo | Dependências | Critérios de pronto |
|---|------|----------|--------------|---------------------|
| F1 | Integração Supabase no fluxo de agendamento | Consumir services/work-hours via TanStack Query, gerar slots e criar agendamentos via edge function | B1, B3 | Fluxo `/agendar` executa ponta-a-ponta, estados de loading/erro, testes de integração de hooks |
| F2 | Autenticação admin | Implementar login magic link com Supabase Auth e proteger rotas `/admin` | F1 (parcial) | Guardas de rota, persistência de sessão, feedbacks visuais, testes de e2e de navegação |
| F3 | CRUDs do painel | Construir telas para services, work_hours e vacations com formulários `react-hook-form + zod` | F2 | Operações optimistic, validações alinhadas ao backend, cobertura de interações principais |
| F4 | Pós-agendamento & notificações | Página `/:token`, cancelamento seguro e onboarding de push | F1, B3 | ⚠️ Página `/:token` pendente; notificações push habilitadas nas edge functions |

## Trilha 3 · Automação & Qualidade
| # | Item | Objetivo | Dependências | Critérios de pronto |
|---|------|----------|--------------|---------------------|
| A1 | Pipeline CI (GitHub Actions) | Rodar lint, typecheck, vitest e verificação básica de migrations a cada PR | B1 | ✅ `.github/workflows/ci.yml` rodando lint/typecheck/test + `supabase db lint` |
| A2 | Testes automatizados Supabase functions | Suíte unitária/integrada executável local e no CI | B3 | Scripts `npm run test:functions`, mocks/replay para disponibilidade |
| A3 | Ergonomia dev | Scripts npm para seed/reset, trigger de funções, mock push; docs atualizados | B2, B3 | ✅ Scripts (`supabase:seed`, `supabase:lint`), README atualizado, checklist revisado |
| A4 | Estratégia de release | Checklist para deploy de migrations e edge functions + automação de dependências | A1 | Documentos `docs/release.md`, tasks Renovate/Dependabot configuradas |

## Sequenciamento sugerido
1. Concluir trilha Backend (B1 → B3) garantindo base estável.
2. Em paralelo, abrir F1 com parceria para validar contratos e payloads.
3. Após B3, agendar cron/jobs (B4) e iniciar F2/F3.
4. Fechar ciclo com trilha Automação (A1 → A4) garantindo CI e governança.

## Anotações rápidas
- Criar issues GitHub a partir dos itens acima referenciando os IDs (B1, F2, etc.) para rastreabilidade.
- Atualizar este plano a cada review de sprint, mantendo histórico via PR.
- Qualquer mudança em políticas RLS deve ser acompanhada de testes automatizados antes do merge.
