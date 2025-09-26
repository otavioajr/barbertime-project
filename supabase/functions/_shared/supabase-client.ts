import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.58.0';

import type { Database } from '../../types.ts';
import { getEnv } from './env.ts';

let cached: SupabaseClient<Database> | null = null;

export function getServiceClient(): SupabaseClient<Database> {
  if (cached) {
    return cached;
  }

  const env = getEnv();
  cached = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
}
