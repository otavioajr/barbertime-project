import { z } from 'zod';

const dateFilterSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().date().optional(),
);

export const appointmentFilterSchema = z.object({
  status: z.enum(['all', 'scheduled', 'confirmed', 'canceled', 'completed']).default('all'),
  search: z.string().trim().optional(),
  from: dateFilterSchema,
  to: dateFilterSchema,
});

export type AppointmentFilterValues = z.infer<typeof appointmentFilterSchema>;

export const appointmentActionSchema = z.object({
  appointmentId: z.string().uuid(),
  publicToken: z.string().min(6),
  action: z.enum(['cancel', 'confirm', 'complete']),
});

export type AppointmentActionPayload = z.infer<typeof appointmentActionSchema>;
