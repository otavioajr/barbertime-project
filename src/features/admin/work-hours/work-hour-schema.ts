import { z } from 'zod';

export const workHourFormSchema = z.object({
  id: z.string().uuid().optional(),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inicial inválido'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário final inválido'),
  active: z.boolean().default(true),
});

export type WorkHourFormValues = z.infer<typeof workHourFormSchema>;
