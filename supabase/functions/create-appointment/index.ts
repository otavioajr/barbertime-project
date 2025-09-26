import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { addMinutes } from 'npm:date-fns@4.1.0';
import { formatInTimeZone, zonedTimeToUtc } from 'npm:date-fns-tz@3.2.0';
import { parsePhoneNumberFromString } from 'npm:libphonenumber-js@1.12.22';
import { z } from 'npm:zod@3.23.8';

import { generateSlots, findSlot } from '../_shared/availability.ts';
import { getServiceClient } from '../_shared/supabase-client.ts';
import type { Database } from '../../types.ts';

type AppointmentStatus = Database['public']['Enums']['appointment_status'];

type AppRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

type AppInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';
const BLOCKING_STATUSES: AppointmentStatus[] = ['scheduled', 'confirmed'];

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const payloadSchema = z.object({
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  customerName: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => value || null),
  customerPhone: z.string().min(1),
  consentGranted: z.literal(true, {
    errorMap: () => ({ message: 'Consentimento obrigatório para notificar o cliente.' }),
  }),
  pushSubscription: subscriptionSchema.optional(),
});

type Payload = z.infer<typeof payloadSchema>;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

function normalizePhone(phone: string): string {
  const parsed = parsePhoneNumberFromString(phone);
  if (!parsed || !parsed.isValid()) {
    throw new Response(
      JSON.stringify({ message: 'Telefone inválido. Forneça no formato internacional (+55...)' }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  return parsed.number;
}

async function fetchService(serviceId: string) {
  const client = getServiceClient();
  const { data, error } = await client
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('active', true)
    .single<AppRow<'services'>>();

  if (error || !data) {
    throw new Response(
      JSON.stringify({ message: 'Serviço não encontrado ou inativo.' }),
      { status: 404, headers: { 'content-type': 'application/json' } },
    );
  }

  return data;
}

async function fetchContext(rangeStart: Date, rangeEnd: Date) {
  const client = getServiceClient();

  const [workHoursRes, vacationsRes, appointmentsRes] = await Promise.all([
    client
      .from('work_hours')
      .select('*')
      .eq('active', true)
      .returns<AppRow<'work_hours'>[]>(),
    client
      .from('vacations')
      .select('*')
      .lte('starts_on', formatInTimeZone(rangeEnd, DEFAULT_TIMEZONE, 'yyyy-MM-dd'))
      .gte('ends_on', formatInTimeZone(rangeStart, DEFAULT_TIMEZONE, 'yyyy-MM-dd'))
      .returns<AppRow<'vacations'>[]>(),
    client
      .from('appointments')
      .select('*')
      .in('status', BLOCKING_STATUSES)
      .gte('starts_at', rangeStart.toISOString())
      .lte('starts_at', rangeEnd.toISOString())
      .returns<AppRow<'appointments'>[]>(),
  ]);

  const firstError = workHoursRes.error || vacationsRes.error || appointmentsRes.error;
  if (firstError) {
    throw new Response(
      JSON.stringify({ message: 'Falha ao carregar contexto de disponibilidade.', details: firstError.message }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  return {
    workHours: workHoursRes.data ?? [],
    vacations: vacationsRes.data ?? [],
    appointments: appointmentsRes.data ?? [],
  };
}

async function insertAppointment(
  payload: Payload,
  service: AppRow<'services'>,
  startsAtIso: string,
  endsAt: Date,
  normalizedPhone: string,
) {
  const client = getServiceClient();
  const { data, error } = await client
    .from('appointments')
    .insert<AppInsert<'appointments'>[]>([
      {
        service_id: service.id,
        starts_at: startsAtIso,
        ends_at: endsAt.toISOString(),
        customer_name: payload.customerName,
        customer_phone: normalizedPhone,
        status: 'scheduled',
      },
    ])
    .select('id, public_token, starts_at, ends_at, status')
    .single();

  if (error || !data) {
    throw new Response(
      JSON.stringify({ message: 'Não foi possível registrar o agendamento.', details: error?.message }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  return data;
}

async function persistSubscription(publicToken: string, payload: Payload, normalizedPhone: string) {
  if (!payload.pushSubscription) {
    return;
  }

  const client = getServiceClient();
  const { error } = await client.from('push_subscriptions').insert([
    {
      public_token: publicToken,
      customer_phone: normalizedPhone,
      endpoint: payload.pushSubscription.endpoint,
      p256dh: payload.pushSubscription.keys.p256dh,
      auth: payload.pushSubscription.keys.auth,
    },
  ]);

  if (error) {
    console.error('[push_subscriptions] failed to store subscription', error);
  }
}

serve(async (request) => {
  try {
    if (request.method !== 'POST') {
      return jsonResponse(405, { message: 'Método não suportado.' });
    }

    const body = await request.json().catch(() => null);
    const payload = payloadSchema.parse(body);
    const normalizedPhone = normalizePhone(payload.customerPhone);

    const service = await fetchService(payload.serviceId);
    const startsAt = new Date(payload.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      return jsonResponse(400, { message: 'Data/hora inicial inválida.' });
    }

    const endsAt = addMinutes(startsAt, service.duration_min);

    const appointmentDate = formatInTimeZone(startsAt, DEFAULT_TIMEZONE, 'yyyy-MM-dd');
    const rangeStart = zonedTimeToUtc(`${appointmentDate}T00:00:00.000`, DEFAULT_TIMEZONE);
    const rangeEnd = zonedTimeToUtc(`${appointmentDate}T23:59:59.999`, DEFAULT_TIMEZONE);
    const { workHours, vacations, appointments } = await fetchContext(rangeStart, rangeEnd);

    const slots = generateSlots({
      service,
      workHours,
      vacations,
      appointments,
      dateRange: { start: rangeStart, end: rangeEnd },
      rules: {
        timezone: DEFAULT_TIMEZONE,
        minLeadMinutes: 60,
        maxAdvanceDays: 60,
        blockingStatuses: BLOCKING_STATUSES,
      },
      now: new Date(),
    });

    const selectedSlot = findSlot(slots, startsAt.toISOString());
    if (!selectedSlot || selectedSlot.status !== 'available') {
      return jsonResponse(409, {
        message: 'Horário indisponível. Escolha outro intervalo.',
        reason: selectedSlot?.reason ?? 'unavailable',
      });
    }

    const appointment = await insertAppointment(payload, service, startsAt.toISOString(), endsAt, normalizedPhone);
    await persistSubscription(appointment.public_token, payload, normalizedPhone);

    return jsonResponse(201, {
      ok: true,
      appointment: {
        id: appointment.id,
        serviceId: service.id,
        startsAt: appointment.starts_at,
        endsAt: appointment.ends_at,
        status: appointment.status,
        publicToken: appointment.public_token,
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[create-appointment] unexpected error', error);
    return jsonResponse(500, { message: 'Erro inesperado ao criar agendamento.' });
  }
});
