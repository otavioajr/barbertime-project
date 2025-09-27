import { z } from 'zod';

export const appointmentFilterSchema = z.object({
  status: z.enum(['all', 'scheduled', 'confirmed', 'canceled', 'completed']).default('all'),
  search: z.string().trim().optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
});

export type AppointmentFilterValues = z.infer<typeof appointmentFilterSchema>;

export const appointmentActionSchema = z.object({
  appointmentId: z.string().uuid(),
  publicToken: z.string().min(6),
  action: z.enum(['cancel', 'confirm', 'complete']),
});

export type AppointmentActionPayload = z.infer<typeof appointmentActionSchema>;
