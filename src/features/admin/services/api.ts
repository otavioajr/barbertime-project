import type { PostgrestSingleResponse } from '@supabase/supabase-js';

import type { Service } from '@/lib/types';
import type { Database } from '@/lib/supabase/types';
import { getSupabaseClient } from '@/lib/supabase/client';

import type { ServiceFormValues } from './service-schema';

type ServiceRow = Database['public']['Tables']['services']['Row'];

type UpsertPayload = Omit<ServiceFormValues, 'id'>;

function mapRow(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    durationMin: row.duration_min,
    priceCents: row.price_cents,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function fetchAllServices(): Promise<Service[]> {
  const supabase = getSupabaseClient();
  const { data, error }: PostgrestSingleResponse<ServiceRow[]> = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message ?? 'Falha ao carregar serviços.');
  }

  return (data ?? []).map(mapRow);
}

export async function createService(payload: UpsertPayload): Promise<Service> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('services')
    .insert({
      name: payload.name,
      duration_min: payload.durationMin,
      price_cents: payload.priceCents,
      active: payload.active,
    })
    .select('*')
    .single<ServiceRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'Não foi possível criar o serviço.');
  }

  return mapRow(data);
}

export async function updateService(id: string, payload: UpsertPayload): Promise<Service> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('services')
    .update({
      name: payload.name,
      duration_min: payload.durationMin,
      price_cents: payload.priceCents,
      active: payload.active,
    })
    .eq('id', id)
    .select('*')
    .single<ServiceRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'Não foi possível atualizar o serviço.');
  }

  return mapRow(data);
}

export async function toggleServiceStatus(id: string, active: boolean): Promise<Service> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('services')
    .update({ active })
    .eq('id', id)
    .select('*')
    .single<ServiceRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'Não foi possível alterar o status do serviço.');
  }

  return mapRow(data);
}
