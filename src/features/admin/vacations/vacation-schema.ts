import { z } from 'zod';

export const vacationFormSchema = z
  .object({
    id: z.string().uuid().optional(),
    startsOn: z.string().date('Data inicial inválida'),
    endsOn: z.string().date('Data final inválida'),
    reason: z
      .string()
      .trim()
      .max(160, 'Motivo deve ter no máximo 160 caracteres')
      .optional()
      .transform((value) => value || null),
  })
  .refine((data) => new Date(data.startsOn) <= new Date(data.endsOn), {
    message: 'Data final deve ser maior ou igual à data inicial',
    path: ['endsOn'],
  });

export type VacationFormValues = z.infer<typeof vacationFormSchema>;
