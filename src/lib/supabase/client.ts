import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getResolvedSupabaseConfig } from './config';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the Supabase client.
 * Uses environment variables when provided, or defaults to the project's
 * public endpoint and publishable key so that Vercel previews and
 * other client devices function immediately without manual configuration.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { url: supabaseUrl, key: supabaseKey } = getResolvedSupabaseConfig();

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
  });

  return supabaseInstance;
}

export const supabase = {
  get client(): SupabaseClient {
    return getSupabaseClient();
  },
};
