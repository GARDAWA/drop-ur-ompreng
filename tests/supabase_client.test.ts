import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY } from '@/lib/supabase/config';

describe('Supabase Client Foundation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('initializes Supabase client successfully with explicit env vars', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'custom_key_123';

    const { getSupabaseClient } = await import('@/lib/supabase');
    const client = getSupabaseClient();

    expect(client).toBeDefined();
    expect((client as unknown as { supabaseUrl: string }).supabaseUrl).toBe('https://custom.supabase.co');
    expect((client as unknown as { supabaseKey: string }).supabaseKey).toBe('custom_key_123');
  });

  it('supports legacy NEXT_PUBLIC_SUPABASE_ANON_KEY as fallback', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy_anon_key_test';

    const { getSupabaseClient } = await import('@/lib/supabase');
    const client = getSupabaseClient();

    expect(client).toBeDefined();
    expect((client as unknown as { supabaseKey: string }).supabaseKey).toBe('legacy_anon_key_test');
  });

  it('falls back to default publishable credentials when env vars are absent on Vercel preview/prod', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getSupabaseClient } = await import('@/lib/supabase');
    const client = getSupabaseClient();

    expect(client).toBeDefined();
    expect((client as unknown as { supabaseUrl: string }).supabaseUrl).toBe(DEFAULT_SUPABASE_URL);
    expect((client as unknown as { supabaseKey: string }).supabaseKey).toBe(DEFAULT_SUPABASE_KEY);
  });

  it('returns singleton instance on repeated calls', async () => {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const client1 = getSupabaseClient();
    const client2 = getSupabaseClient();

    expect(client1).toBe(client2);
  });
});
