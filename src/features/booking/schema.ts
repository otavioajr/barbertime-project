import { isValidNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';

export const bookingDetailsSchema = z.object({
  customerName: z
    .string()
    .trim()
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional()
    .transform((value) => value || undefined),
  customerPhone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine((value) => {
      const parsed = parsePhoneNumberFromString(value);
      return Boolean(parsed && parsed.isValid());
    }, 'Informe um telefone válido no formato internacional (+55...)'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'É necessário autorizar o envio de notificações.' }),
  }),
});

export type BookingDetailsInput = z.infer<typeof bookingDetailsSchema>;

export function normalizePhoneNumber(value: string): string {
  const parsed = parsePhoneNumberFromString(value);
  if (parsed && isValidNumber(parsed.number, parsed.country)) {
    return parsed.number;
  }

  return value;
}
