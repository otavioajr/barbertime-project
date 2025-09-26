import { z } from 'zod';

type EnvSource = Record<string, unknown>;

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url({ message: 'VITE_SUPABASE_URL deve ser uma URL válida' }),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, { message: 'VITE_SUPABASE_ANON_KEY é obrigatório' }),
  VITE_VAPID_PUBLIC_KEY: z.string().optional(),
  VITE_DEFAULT_TIMEZONE: z.string().default('America/Sao_Paulo'),
});

export function getClientEnv(source: EnvSource = import.meta.env): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const formatted = result.error.errors.map((error) => `${error.path.join('.')}: ${error.message}`).join('\n');
    throw new Error(`Variáveis de ambiente inválidas:\n${formatted}`);
  }

  return result.data;
}
