import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { addHours, isWithinInterval } from 'npm:date-fns@4.1.0';
import { formatInTimeZone } from 'npm:date-fns-tz@3.2.0';
import { z } from 'npm:zod@3.23.8';

import { broadcastNotification } from '../_shared/push.ts';
import { getServiceClient } from '../_shared/supabase-client.ts';
import type { Database } from '../../types.ts';

const payloadSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  windowStart: z.string().datetime().optional(),
  windowEnd: z.string().datetime().optional(),
  reminderOffsetHours: z.number().int().positive().max(24).default(2),
});

type Payload = z.infer<typeof payloadSchema>;

const SUPPORTED_STATUSES: Array<Database['public']['Enums']['appointment_status']> = ['scheduled', 'confirmed'];
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

type ReminderAppointment = Database['public']['Tables']['appointments']['Row'] & {
  services?: { name: string } | null;
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

async function fetchAppointments(payload: Payload) {
  const client = getServiceClient();
  const query = client
    .from('appointments')
    .select('id, starts_at, ends_at, status, public_token, customer_phone, services(name)')
    .in('status', SUPPORTED_STATUSES)
    .eq('reminder_sent', false);

  if (payload.appointmentId) {
    query.eq('id', payload.appointmentId);
  }

  if (payload.windowStart) {
    query.gte('starts_at', payload.windowStart);
  }
  if (payload.windowEnd) {
    query.lte('starts_at', payload.windowEnd);
  }

  const { data, error } = await query.returns<ReminderAppointment[] | null>();
  if (error) {
    throw new Response(
      JSON.stringify({ message: 'Erro ao buscar agendamentos para lembrete.', details: error.message }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  return data ?? [];
}

async function markReminderSent(ids: string[]) {
  if (!ids.length) return;
  const client = getServiceClient();
  const { error } = await client
    .from('appointments')
    .update({ reminder_sent: true })
    .in('id', ids);

  if (error) {
    console.error('[send-reminder] failed to mark reminder_sent', error);
  }
}

serve(async (request) => {
  try {
    if (request.method !== 'POST') {
      return jsonResponse(405, { message: 'Método não suportado.' });
    }

    const raw = await request.json().catch(() => null);
    const payload = payloadSchema.parse(raw ?? {});

    const candidates = await fetchAppointments(payload);
    const now = new Date();
    const effectiveWindow = {
      start: payload.windowStart ? new Date(payload.windowStart) : now,
      end: payload.windowEnd ? new Date(payload.windowEnd) : addHours(now, payload.reminderOffsetHours),
    };

    const toNotify = candidates.filter((appointment) =>
      isWithinInterval(new Date(appointment.starts_at), {
        start: effectiveWindow.start,
        end: effectiveWindow.end,
      }),
    );

    for (const appointment of toNotify) {
      const formattedDate = formatInTimeZone(new Date(appointment.starts_at), DEFAULT_TIMEZONE, "dd/MM/yyyy 'às' HH:mm");
      await broadcastNotification(appointment.public_token, appointment.customer_phone, {
        title: 'Lembrete de agendamento',
        body: `${appointment.services?.name ?? 'Seu horário'} em ${formattedDate}`,
        url: `/agendamento/${appointment.public_token}`,
      });
    }

    await markReminderSent(toNotify.map((item) => item.id));

    return jsonResponse(200, {
      ok: true,
      processed: toNotify.length,
      totalMatched: candidates.length,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[send-reminder] unexpected error', error);
    return jsonResponse(500, { message: 'Erro inesperado ao processar lembretes.' });
  }
});
