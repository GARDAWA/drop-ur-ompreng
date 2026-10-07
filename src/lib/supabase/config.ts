/**
 * Supabase client configuration.
 *
 * Public client-side URL and Publishable/Anon key.
 * In Supabase architecture, the publishable/anon key is intentionally public
 * and secured via Row Level Security (RLS) and SECURITY DEFINER RPCs on the database.
 *
 * Default fallback values guarantee immediate availability on Vercel deployments
 * without requiring manual env injection.
 */
export const DEFAULT_SUPABASE_URL = 'https://nrmzrlmndzpslqhiarba.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_wDQiSUgbavga3na96UZxHA_GE8ZicNO';

export function getResolvedSupabaseConfig(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY;

  return { url, key };
}
