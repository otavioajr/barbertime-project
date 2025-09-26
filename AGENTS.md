Agents – Repository Guidelines (Codex)

Este documento define estrutura, contratos e padrões para agentes do projeto. Use-o como referência para criar, integrar e testar novos agentes.

⸻

Project Structure & Modules
	•	agents/ — raiz do sistema de agentes.
	•	agents/index.ts — registro global (slug → loader) e export de fábricas/utilitários.
	•	agents/core/ — tipos base e orquestração
	•	types.ts — Agent, AgentContext, AgentMessage, AgentResponse, RouterDecision, Tool, Observation, RunResult.
	•	orchestrator.ts — seleção/roteamento de agentes, ciclo de execução, retries/backoff.
	•	router.ts — heurísticas e regras de roteamento (intent → agente.
	•	tools.ts — adaptadores (HTTP, DB, Supabase, Queue, Logger, Tracing).
	•	agents/router/ — entrypoint para integração externa
	•	handler.ts — expõe route()/handle() consolidando core + impl.
	•	agents/impl/ — agentes de domínio
	•	planning-agent/ — exemplo de agente (arquivos: handler.ts, schema.ts, tools.ts, index.ts).
	•	… outros (ex.: db-architect-agent, frontend-agent, notifications-agent).
	•	agents/docs/ — ADRs, anotações de design e exemplos de contratos .md.
	•	tests/ — testes unitários/integração; espelham a árvore de agents/.
	•	docs/ — documentação geral do repositório (este arquivo pode ser espelhado lá).

Regra: cada agente ganha uma pasta própria em agents/impl/<slug>/ e é registrado em agents/index.ts.

⸻

Build, Test, and Dev
	•	npm install — instala dependências.
	•	npm run dev — roda localmente com hot-reload (tsx/ts-node).
	•	npm run build — compila TypeScript para dist/.
	•	npm test — executa testes com cobertura.
	•	npm run lint / npm run format — ESLint/Prettier.

⸻

Coding Style & Naming Conventions
	•	Linguagem: TypeScript (strict). Indentação: 2 espaços. Semicolons: on.
	•	Lint/format: ESLint + Prettier (fix com npm run lint -- --fix).
	•	Arquivos: kebab-case. IDs de agentes: kebab-case com sufixo -agent (ex.: db-architect-agent).
	•	Domínios sugeridos: planning | db | api | frontend | notifications | qa | devops | docs | security.
	•	Cada agente exporta no index.ts: id, role, domains, canHandle(msg, task), create(), handle(ctx).

⸻

Agent Contract (Markdown Header)

Para cada agente, crie um arquivo .md com o contrato e link para a implementação real em agents/impl/<slug>/handler.ts.

Cabeçalho padrão:

## Objetivo
Descreva o propósito do agente. Problemas que resolve e métricas de sucesso.

## Entrada
Defina payload esperado (mensagem, contexto, artefatos, flags). Liste schemas Zod/TypeBox se existirem.

## Saída
Defina o formato de resposta (estruturas, side-effects, eventos, artefatos gerados).

## Ferramentas
Quais ferramentas (HTTP, Supabase, Filas, Logger, LLM) o agente pode invocar e com quais limites.

## Fluxo
Passo a passo de execução (pseudocódigo/diagrama). Inclua estratégias de retry e fallback.

## Observabilidade
Logs estruturados (campos-chave), métricas (contadores/latências), traces (spans) e correlação (requestId/runId).

## Testes
Casos mínimos, mocks necessários, dados seed e critérios de aprovação.

## Função
(Área para colar a assinatura/trechos críticos da implementação quando necessário.)

Dica: mantenha este .md próximo do código para reduzir drift entre documentação e implementação.

⸻

Core Types (Resumo)

// agents/core/types.ts
export type AgentId = string;
export type Domain =
  | 'planning' | 'db' | 'api' | 'frontend' | 'notifications' | 'qa' | 'devops' | 'docs' | 'security';

export interface AgentMessage {
  id: string; // msg id
  text?: string;
  task?: string; // id/slug da tarefa
  data?: unknown; // payload estruturado
  meta?: Record<string, unknown>; // origem, canal, prioridade, locale
}

export interface AgentResponse<T = unknown> {
  ok: boolean;
  output?: T;
  events?: Array<{ type: string; payload?: unknown }>; // webhooks, emit, etc.
  logs?: Array<Record<string, unknown>>; // key-values para log estruturado
  error?: { code: string; message: string; cause?: unknown };
}

export interface AgentContext {
  runId: string;
  now: Date;
  domain: Domain;
  env: Record<string, string | undefined>;
  tools: Tools;
  logger: Logger;
  trace: Trace;
  input: AgentMessage;
}

export interface Agent {
  id: AgentId;
  role: string;
  domains: Domain[];
  canHandle: (msg: AgentMessage) => boolean | Promise<boolean>;
  handle: (ctx: AgentContext) => Promise<AgentResponse>;
}


⸻

Orchestrator & Router
	•	Orchestrator (agents/core/orchestrator.ts)
	•	Resolve domínio via domainFromMessage(msg).
	•	Seleciona lista de candidatos via registry.byDomain(domain).
	•	Aplica canHandle() para filtrar e escolhe o vencedor (score heurístico/chain-of-thought guardado internamente).
	•	Executa handle(ctx) com retries exponenciais (config padrão: maxRetries=2, baseDelay=250ms).
	•	Emite RouterDecision com { selected, alternatives, notes }.
	•	Router (agents/core/router.ts)
	•	Tabelas de roteamento Intent → Critérios → Agente.
	•	Estratégias de fallback: (1) agente default por domínio, (2) agente de diagnóstico (qa-agent), (3) devolutiva para humano.

⸻

Tools Layer
	•	HttpTool — fetch com timeouts/retries e circuito.
	•	SupabaseTool — queries tipadas, RLS-aware, RPC, storage; helpers de paginação.
	•	QueueTool — enfileirar trabalhos/cron.
	•	LoggerTool — logs estruturados JSONL.
	•	TraceTool — spans, eventos, atributos; integração OpenTelemetry se disponível.

Política: ferramentas devem ser puras e injetadas via ctx.tools; não acessar process.env diretamente no agente.

⸻

Error Handling & Retries
	•	Padrão de erro: { code, message, cause } com código estável.
	•	Idempotência: sempre que houver efeitos externos, use runId/msg.id como chave de deduplicação.
	•	Retries: maxRetries=2 com backoff exponencial + jitter; classifique erros como transient x permanent.

⸻

Testing Guidelines
	•	Framework: Vitest (ou Jest). Nomeie testes *.spec.ts.
	•	Testes próximos ao código OU em tests/ espelhando caminhos (ex.: agents/core/orchestrator.spec.ts).
	•	Cobertura alvo: ≥80%. Use npm test -- --coverage.
	•	Utilize mocks de Tools e fixtures de mensagens; valide logs/metrics mínimos.

⸻

Commit & Pull Request Guidelines
	•	Conventional Commits: feat:, fix:, docs:, refactor:, test:, chore:, ci:.
	•	PRs devem conter: sumário, racional, issues relacionadas e screenshots (quando UI).
	•	CI deve passar: build, testes, lint/format. Prefira PRs pequenos e focados.

⸻

Architecture Notes
	•	Orquestrador roteia por domínio a partir de AgentMessage; router.route() retorna agente escolhido, próximos passos e alternativas.
	•	Para adicionar um agente:
	1.	Criar pasta agents/impl/<slug>-agent/ com handler.ts, schema.ts, tools.ts, index.ts.
	2.	Registrar em agents/index.ts no defaultAgents com seu domínio.
	3.	(Opcional) Atualizar domainFromMessage()/regras no router.ts.
	4.	Adicionar contrato .md em agents/docs/<Slug>.md (cabeçalho padrão).
	•	Preferir agentes stateless e sem segredos no código. Use .env e env.example.

⸻

Example – Registration (agents/index.ts)

import { registry } from './core/orchestrator';
import { createPlanningAgent } from './impl/planning-agent';
import { createFrontendAgent } from './impl/frontend-agent';

export const defaultAgents = [
  createPlanningAgent(),
  createFrontendAgent(),
  // ...outros
];

registry.register(defaultAgents);
export * from './core/types';


⸻

Example – Agent Skeleton

agents/impl/planning-agent/index.ts

import type { Agent } from '../../core/types';
import { handle } from './handler';

export function createPlanningAgent(): Agent {
  return {
    id: 'planning-agent',
    role: 'Planejamento de entregas e escopo',
    domains: ['planning'],
    canHandle: (msg) => Boolean(msg.task?.includes('plan') || msg.meta?.intent === 'plan'),
    handle,
  };
}

agents/impl/planning-agent/handler.ts

import type { AgentContext, AgentResponse } from '../../core/types';

export async function handle(ctx: AgentContext): Promise<AgentResponse> {
  const { logger, input, trace } = ctx;
  const span = trace.startSpan('planning-agent.handle');
  try {
    logger.info({ runId: ctx.runId, msgId: input.id, intent: input.meta?.intent }, 'planning:start');
    // ... lógica principal
    return { ok: true, output: { plan: [] } };
  } catch (error) {
    logger.error({ runId: ctx.runId, err: String(error) }, 'planning:error');
    return { ok: false, error: { code: 'PLANNING_ERROR', message: 'Failed to plan', cause: String(error) } };
  } finally {
    span.end();
  }
}


⸻

Example – Router Table (docs)

Intent	Critérios	Agente
plan	msg.meta.intent === ‘plan’	planning-agent
design-ui	domain === ‘frontend’ OU texto contém UI/layout	frontend-agent
create-db-schema	domain === ‘db’	db-architect-agent
notify	domain === ‘notifications’	notifications-agent
fallback	nenhum atende	qa-agent

Estratégias de fallback: (1) agente default do domínio; (2) qa-agent para diagnóstico; (3) encaminhar para humano.

⸻

Observability – Logging & Tracing
	•	Logs estruturados: inclua runId, agentId, msgId, intent, latencyMs, outcome.
	•	Métricas: contadores por agente, histogramas de latência, taxa de erro.
	•	Tracing: um span por handle() + spans por chamadas externas (HTTP/DB). Propague traceparent se houver.

⸻

Security & Compliance
	•	Sem segredos hard-coded. Use process.env via injeção em ctx.env.
	•	Sanitização/validação de entrada (Zod/TypeBox) antes de handle().
	•	IDs e tokens opacos; nunca logar PII sensível.

⸻

Ready‑to‑Use Checklists

Novo agente
	•	Pasta agents/impl/<slug>-agent/ criada.
	•	Contrato .md com cabeçalho padrão em agents/docs/.
	•	index.ts exporta create<PascalCase>Agent().
	•	Registrado em agents/index.ts.
	•	Testes *.spec.ts criados com mocks de tools.

Roteamento
	•	Atualizar tabela de intents (docs) e router.ts se necessário.
	•	Definir fallback e prioridades.

Observabilidade
	•	Logs mínimos padronizados.
	•	Métricas registradas.
	•	Traces com spans externos.

⸻

Appendix – Mensagem & Resposta (JSON Schema)

// Mensagem mínima aceitável
{
  id: string,
  text?: string,
  task?: string,
  data?: unknown,
  meta?: { intent?: string; domain?: string; priority?: 'low'|'normal'|'high'; locale?: string }
}

// Resposta canônica
{
  ok: boolean,
  output?: unknown,
  events?: Array<{ type: string; payload?: unknown }>,
  logs?: Array<Record<string, unknown>>,
  error?: { code: string; message: string; cause?: unknown }
}


⸻

Fim. Este agents.md serve como fonte única de verdade para criação, registro, roteamento e operação de agentes no projeto. Mantenha-o versionado e atualizado com cada mudança relevante.