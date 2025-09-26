# Supabase Policy Checklist

Breve roteiro para validar as políticas de RLS e funções antes de cada release.

## Consultas rápidas (CLI ou psql)
- `select * from auth.users limit 1;` para garantir usuários seed.
- `select * from public.services;` deve retornar linhas para papel `anon`.
- `select * from public.appointments;` somente quando autenticado como admin ou `service_role`.

## Testes de smoke
1. Criar agendamento via edge function `create-appointment` usando token `service_role` e telefone válido.
2. Verificar que o agendamento aparece para admin (`supabase functions invoke ... --headers "Authorization: Bearer <jwt>"`).
3. Confirmar que o cliente consegue recuperar/cancelar usando `public_token` (função `cancel-appointment`).
4. Confirmar que usuários anônimos não conseguem `select * from public.appointments` diretamente.

## Índices e constraints
- `appointments_customer_phone_idx` garante busca rápida por telefone.
- `push_subscriptions_public_token_phone_key` impede duplicidade de subscription.
- `vacations_range_idx` acelera detecção de férias.
- `work_hours_start_before_end` evita janelas mal definidas.

Atualize este checklist sempre que novas políticas ou constraints forem adicionadas.
