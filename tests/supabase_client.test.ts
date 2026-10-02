import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Supabase Client Foundation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('initializes Supabase client successfully with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://nrmzrlmndzpslqhiarba.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wDQiSUgbavga3na96UZxHA_GE8ZicNO';

    const { getSupabaseClient } = await import('@/lib/supabase');
    const client = getSupabaseClient();

    expect(client).toBeDefined();
    expect((client as unknown as { supabaseUrl: string }).supabaseUrl).toBe('https://nrmzrlmndzpslqhiarba.supabase.co');
    expect((client as unknown as { supabaseKey: string }).supabaseKey).toBe('sb_publishable_wDQiSUgbavga3na96UZxHA_GE8ZicNO');
  });

  it('supports legacy NEXT_PUBLIC_SUPABASE_ANON_KEY as fallback', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://nrmzrlmndzpslqhiarba.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy_anon_key_test';

    const { getSupabaseClient } = await import('@/lib/supabase');
    const client = getSupabaseClient();

    expect(client).toBeDefined();
    expect((client as unknown as { supabaseKey: string }).supabaseKey).toBe('legacy_anon_key_test');
  });

  it('returns singleton instance on repeated calls', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://nrmzrlmndzpslqhiarba.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wDQiSUgbavga3na96UZxHA_GE8ZicNO';

    const { getSupabaseClient } = await import('@/lib/supabase');
    const client1 = getSupabaseClient();
    const client2 = getSupabaseClient();

    expect(client1).toBe(client2);
  });

  it('throws descriptive error if environment variables are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { getSupabaseClient } = await import('@/lib/supabase');
    expect(() => getSupabaseClient()).toThrow(/Missing Supabase environment variables/);
  });
});
