import type { Database } from '@/lib/supabase/types';
import type { Service } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase/client';

type ServiceRow = Database['public']['Tables']['services']['Row'];

export async function fetchServices(): Promise<Service[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message ?? 'Não foi possível carregar serviços.');
  }

  const rows = data ?? [];

  return rows.map((row: ServiceRow): Service => ({
    id: row.id,
    name: row.name,
    durationMin: row.duration_min,
    priceCents: row.price_cents,
    active: row.active,
    createdAt: row.created_at,
  }));
}
