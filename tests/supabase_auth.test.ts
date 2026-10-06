import { describe, it, expect } from 'vitest';
import { signInAsGuest } from '@/lib/supabase/auth';

describe('Supabase Guest Authentication', () => {
  it('authenticates a guest user with username and generates valid session state', async () => {
    const res = await signInAsGuest('budi_santoso', 'secret12345');
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.user?.username).toBe('budi_santoso');
    expect(res.user?.id).toBeDefined();
  });

  it('handles empty username gracefully with fallback identifier', async () => {
    const res = await signInAsGuest('');
    expect(res.success).toBe(true);
    expect(res.user?.username).toBeDefined();
    expect(res.user?.id).toBeDefined();
  });
});
