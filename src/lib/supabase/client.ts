import { type SupabaseClient, createClient } from '@supabase/supabase-js';

import { getClientEnv } from '../env';
import type { Database } from './types';

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (client) {
    return client;
  }

  const env = getClientEnv();
  client = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
