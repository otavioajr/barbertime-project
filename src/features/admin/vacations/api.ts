import type { Database } from '@/lib/supabase/types';
import type { Vacation } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase/client';

import type { VacationFormValues } from './vacation-schema';

type VacationRow = Database['public']['Tables']['vacations']['Row'];

type UpsertPayload = Omit<VacationFormValues, 'id'>;

function mapRow(row: VacationRow): Vacation {
  return {
    id: row.id,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export async function fetchVacations(): Promise<Vacation[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vacations')
    .select('*')
    .order('starts_on', { ascending: true });

  if (error) {
    throw new Error(error.message ?? 'Falha ao carregar períodos de férias.');
  }

  return (data ?? []).map(mapRow);
}

export async function createVacation(payload: UpsertPayload): Promise<Vacation> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vacations')
    .insert({
      starts_on: payload.startsOn,
      ends_on: payload.endsOn,
      reason: payload.reason,
    })
    .select('*')
    .single<VacationRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'Não foi possível registrar o período.');
  }

  return mapRow(data);
}

export async function updateVacation(id: string, payload: UpsertPayload): Promise<Vacation> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vacations')
    .update({
      starts_on: payload.startsOn,
      ends_on: payload.endsOn,
      reason: payload.reason,
    })
    .eq('id', id)
    .select('*')
    .single<VacationRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'Não foi possível atualizar o período.');
  }

  return mapRow(data);
}

export async function deleteVacation(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('vacations').delete().eq('id', id);

  if (error) {
    throw new Error(error.message ?? 'Não foi possível remover o período.');
  }
}
