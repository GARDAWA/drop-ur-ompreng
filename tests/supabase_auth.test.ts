import { describe, it, expect } from 'vitest';
import { signInUser, signUpUser, signInAsGuest, getActiveSession } from '@/lib/supabase/auth';

describe('Supabase Complete Authentication System', () => {
  it('validates input length on signup', async () => {
    const resShortUser = await signUpUser('a', '123456');
    expect(resShortUser.success).toBe(false);
    expect(resShortUser.error).toContain('minimal 3 karakter');

    const resShortPass = await signUpUser('kurir_baru', '123');
    expect(resShortPass.success).toBe(false);
    expect(resShortPass.error).toContain('minimal 6 karakter');
  });

  it('validates non-empty inputs on signin', async () => {
    const resEmpty = await signInUser('', '');
    expect(resEmpty.success).toBe(false);
  });

  it('creates guest session with Guest_ prefix when requested', async () => {
    const res = await signInAsGuest();
    expect(res.success).toBe(true);
    expect(res.user?.username).toMatch(/^Guest_\d{4}$/);
    expect(res.user?.id).toBeDefined();
  });
});
