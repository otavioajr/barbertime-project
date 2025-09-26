import { getSupabaseClient } from '@/lib/supabase/client';

interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface CreateAppointmentPayload {
  serviceId: string;
  startsAt: string;
  customerName?: string | null;
  customerPhone: string;
  consentGranted: true;
  pushSubscription?: PushSubscriptionPayload;
}

interface CreateAppointmentResponse {
  ok: boolean;
  appointment: {
    id: string;
    serviceId: string;
    startsAt: string;
    endsAt: string;
    publicToken: string;
    status: string;
  };
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<CreateAppointmentResponse['appointment']> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<CreateAppointmentResponse>('create-appointment', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message ?? 'Falha ao criar agendamento.');
  }

  if (!data?.ok) {
    throw new Error('Falha ao criar agendamento.');
  }

  return data.appointment;
}
