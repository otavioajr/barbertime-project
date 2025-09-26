import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { isBefore } from 'npm:date-fns@4.1.0';
import { z } from 'npm:zod@3.23.8';

import { getServiceClient } from '../_shared/supabase-client.ts';
import type { Database } from '../../types.ts';

const payloadSchema = z.object({
  publicToken: z.string().min(6),
  cancelReason: z.string().max(280).optional(),
});

const CANCELABLE_STATUSES: Array<Database['public']['Enums']['appointment_status']> = ['scheduled', 'confirmed'];

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

serve(async (request) => {
  try {
    if (request.method !== 'POST') {
      return jsonResponse(405, { message: 'Método não suportado.' });
    }

    const raw = await request.json().catch(() => null);
    const payload = payloadSchema.parse(raw ?? {});

    const client = getServiceClient();
    const { data, error } = await client
      .from('appointments')
      .select('id, starts_at, status')
      .eq('public_token', payload.publicToken)
      .single();

    if (error || !data) {
      return jsonResponse(404, { message: 'Agendamento não encontrado.' });
    }

    if (!CANCELABLE_STATUSES.includes(data.status)) {
      return jsonResponse(409, { message: 'Agendamento não está elegível para cancelamento.' });
    }

    if (isBefore(new Date(data.starts_at), new Date())) {
      return jsonResponse(409, { message: 'Não é possível cancelar um agendamento no passado.' });
    }

    const { error: updateError } = await client
      .from('appointments')
      .update({ status: 'canceled', reminder_sent: false })
      .eq('id', data.id);

    if (updateError) {
      throw new Response(
        JSON.stringify({ message: 'Falha ao cancelar agendamento.', details: updateError.message }),
        { status: 500, headers: { 'content-type': 'application/json' } },
      );
    }

    // Limpa subscriptions associadas ao token para evitar notificações futuras
    const { error: cleanupError } = await client
      .from('push_subscriptions')
      .delete()
      .eq('public_token', payload.publicToken);

    if (cleanupError) {
      console.warn('[cancel-appointment] failed to cleanup push subscription', cleanupError);
    }

    console.info('[cancel-appointment]', payload.publicToken, payload.cancelReason ?? 'no-reason');

    return jsonResponse(200, { ok: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[cancel-appointment] unexpected error', error);
    return jsonResponse(500, { message: 'Erro inesperado ao cancelar agendamento.' });
  }
});
