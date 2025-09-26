import type { AvailabilitySlot } from '@/features/availability/types';
import { getSupabaseClient } from '@/lib/supabase/client';

interface AvailabilityPayload {
  serviceId: string;
  startDate: string;
  days: number;
  timezone: string;
}

interface AvailabilityResponse {
  ok: boolean;
  slots: AvailabilitySlot[];
}

export async function fetchAvailability(payload: AvailabilityPayload): Promise<AvailabilitySlot[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<AvailabilityResponse>('get-availability', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message ?? 'Falha ao obter disponibilidade.');
  }

  if (!data?.ok) {
    throw new Error('Falha ao obter disponibilidade.');
  }

  return data.slots;
}
