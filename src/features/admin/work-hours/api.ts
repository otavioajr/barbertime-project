import type { Database } from '@/lib/supabase/types';
import type { WorkHour } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase/client';

import type { WorkHourFormValues } from './work-hour-schema';

type WorkHourRow = Database['public']['Tables']['work_hours']['Row'];

type UpsertPayload = Omit<WorkHourFormValues, 'id'>;

function mapRow(row: WorkHourRow): WorkHour {
  return {
    id: row.id,
    weekday: row.weekday as WorkHour['weekday'],
    startTime: row.start_time,
    endTime: row.end_time,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function fetchWorkHours(): Promise<WorkHour[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('work_hours').select('*').order('weekday');

  if (error) {
    throw new Error(error.message ?? 'Falha ao carregar horários de trabalho.');
  }

  return (data ?? []).map(mapRow);
}

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export async function createWorkHour(payload: UpsertPayload): Promise<WorkHour> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('work_hours')
    .insert({
      weekday: payload.weekday,
      start_time: normalizeTime(payload.startTime),
      end_time: normalizeTime(payload.endTime),
      active: payload.active,
    })
    .select('*')
    .single<WorkHourRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'Não foi possível criar o horário.');
  }

  return mapRow(data);
}

export async function updateWorkHour(id: string, payload: UpsertPayload): Promise<WorkHour> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('work_hours')
    .update({
      weekday: payload.weekday,
      start_time: normalizeTime(payload.startTime),
      end_time: normalizeTime(payload.endTime),
      active: payload.active,
    })
    .eq('id', id)
    .select('*')
    .single<WorkHourRow>();

  if (error || !data) {
    throw new Error(error?.message ?? 'Não foi possível atualizar o horário.');
  }

  return mapRow(data);
}

export async function deleteWorkHour(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('work_hours').delete().eq('id', id);

  if (error) {
    throw new Error(error.message ?? 'Não foi possível remover o horário.');
  }
}
