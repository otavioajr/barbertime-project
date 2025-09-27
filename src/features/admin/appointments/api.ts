import type { Database } from '@/lib/supabase/types';
import type { Appointment } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase/client';

import type { AppointmentActionPayload, AppointmentFilterValues } from './appointments-schema';

const DEFAULT_LIMIT = 50;

type AppointmentRow = Database['public']['Tables']['appointments']['Row'] & {
  services?: { name: string } | null;
};

function mapRow(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    serviceId: row.service_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    status: row.status,
    publicToken: row.public_token,
    createdAt: row.created_at,
    serviceName: row.services?.name ?? null,
  };
}

export async function fetchAppointments(filters: AppointmentFilterValues): Promise<Appointment[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('appointments')
    .select('id, service_id, starts_at, ends_at, customer_name, customer_phone, status, public_token, created_at, services(name)')
    .order('starts_at', { ascending: true })
    .limit(DEFAULT_LIMIT);

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(`customer_phone.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`);
  }

  if (filters.from) {
    query = query.gte('starts_at', `${filters.from}T00:00:00`);
  }

  if (filters.to) {
    query = query.lte('starts_at', `${filters.to}T23:59:59`);
  }

  const { data, error } = await query.returns<AppointmentRow[] | null>();
  if (error) {
    throw new Error(error.message ?? 'Não foi possível carregar os agendamentos.');
  }

  return (data ?? []).map(mapRow);
}

export async function executeAppointmentAction({ appointmentId, publicToken, action }: AppointmentActionPayload): Promise<void> {
  const supabase = getSupabaseClient();

  if (action === 'cancel') {
    const { error } = await supabase.functions.invoke('cancel-appointment', {
      body: { publicToken, cancelReason: 'Admin cancel' },
    });
    if (error) {
      throw new Error(error.message ?? 'Falha ao cancelar agendamento.');
    }
    return;
  }

  const status = action === 'confirm' ? 'confirmed' : 'completed';
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId);
  if (error) {
    throw new Error(error.message ?? 'Falha ao atualizar agendamento.');
  }
}
