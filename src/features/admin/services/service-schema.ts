import { z } from 'zod';

export const serviceFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(80, 'Nome deve ter no máximo 80 caracteres'),
  durationMin: z
    .coerce
    .number({ invalid_type_error: 'Duração deve ser um número em minutos' })
    .int('Duração deve ser um número inteiro')
    .positive('Duração deve ser maior que zero')
    .max(480, 'Duração máxima permitida é 480 minutos'),
  priceCents: z
    .union([
      z.coerce
        .number({ invalid_type_error: 'Preço deve ser um número' })
        .nonnegative('Preço não pode ser negativo'),
      z.literal(''),
      z.null(),
    ])
    .optional()
    .transform((value) => {
      if (value === undefined || value === '' || value === null || Number.isNaN(value)) {
        return null;
      }
      return value;
    }),
  active: z.boolean().default(true),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
