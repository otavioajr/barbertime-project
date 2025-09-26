import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { addDays, startOfDay, endOfDay } from 'npm:date-fns@4.1.0';
import { z } from 'npm:zod@3.23.8';

import { generateSlots } from '../_shared/availability.ts';
import { getServiceClient } from '../_shared/supabase-client.ts';
import type { Database } from '../../types.ts';

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

const querySchema = z.object({
  serviceId: z.string().uuid(),
  startDate: z.string().date().optional(),
  days: z.number().int().positive().max(30).optional().default(3),
  timezone: z.string().optional(),
});

type AppointmentStatus = Database['public']['Enums']['appointment_status'];
const BLOCKING_STATUSES: AppointmentStatus[] = ['scheduled', 'confirmed'];

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

async function fetchService(serviceId: string) {
  const client = getServiceClient();
  const { data, error } = await client
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('active', true)
    .single();

  if (error || !data) {
    throw new Response(JSON.stringify({ message: 'Serviço não encontrado ou inativo.' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  return data;
}

async function fetchContext(rangeStart: Date, rangeEnd: Date, serviceId: string) {
  const client = getServiceClient();

  const [workHoursRes, vacationsRes, appointmentsRes] = await Promise.all([
    client
      .from('work_hours')
      .select('*')
      .eq('active', true),
    client
      .from('vacations')
      .select('*')
      .lte('starts_on', rangeEnd.toISOString().slice(0, 10))
      .gte('ends_on', rangeStart.toISOString().slice(0, 10)),
    client
      .from('appointments')
      .select('*')
      .eq('service_id', serviceId)
      .in('status', BLOCKING_STATUSES)
      .gte('starts_at', rangeStart.toISOString())
      .lte('starts_at', rangeEnd.toISOString()),
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

serve(async (request) => {
  try {
    if (request.method !== 'POST') {
      return jsonResponse(405, { message: 'Método não suportado.' });
    }

    const raw = await request.json().catch(() => null);
    const query = querySchema.parse(raw ?? {});

    const service = await fetchService(query.serviceId);

    const baseDate = query.startDate ? new Date(query.startDate) : new Date();
    const rangeStart = startOfDay(baseDate);
    const rangeEnd = endOfDay(addDays(rangeStart, query.days - 1));

    const { workHours, vacations, appointments } = await fetchContext(rangeStart, rangeEnd, service.id);

    const slots = generateSlots({
      service,
      workHours,
      vacations,
      appointments,
      dateRange: { start: rangeStart, end: rangeEnd },
      rules: {
        timezone: query.timezone ?? DEFAULT_TIMEZONE,
        minLeadMinutes: 60,
        maxAdvanceDays: 60,
        blockingStatuses: BLOCKING_STATUSES,
      },
      now: new Date(),
    });

    return jsonResponse(200, {
      ok: true,
      slots,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[get-availability] unexpected error', error);
    return jsonResponse(500, { message: 'Erro inesperado ao obter disponibilidade.' });
  }
});
