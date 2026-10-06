import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client sebelum import module
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
      insert: mockInsert,
      upsert: vi.fn(),
    }),
    auth: {
      signUp: vi.fn().mockRejectedValue(new Error('email rate limit exceeded')),
      signInWithPassword: vi.fn().mockRejectedValue(new Error('email rate limit exceeded')),
      signInAnonymously: vi.fn().mockRejectedValue(new Error('rate limit')),
      getUser: vi.fn(),
    },
  }),
}));

describe('Custom Credential Auth (tanpa Supabase Auth email)', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSelect.mockClear();
    mockInsert.mockClear();
    mockEq.mockClear();
    mockMaybeSingle.mockClear();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  });

  it('signup menolak username duplikat tanpa memanggil Supabase Auth', async () => {
    const { signUpUser } = await import('@/lib/supabase/auth');
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'x', username: 'kurir911' }, error: null });

    const res = await signUpUser('Kurir-911', 'password123');
    expect(res.success).toBe(false);
    expect(res.error).toContain('sudah digunakan');
  });

  it('signup membuat profil baru dengan password hash (bukan plaintext)', async () => {
    const { signUpUser } = await import('@/lib/supabase/auth');
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockInsert.mockResolvedValue({ error: null });

    const res = await signUpUser('Kurir-911', 'password123');
    expect(res.success).toBe(true);

    // insert dipanggil dengan password_hash berbeda dari plaintext
    const payload = mockInsert.mock.calls[0][0];
    expect(payload.username).toBe('kurir911');
    expect(payload.password_hash).toBeDefined();
    expect(payload.password_hash).not.toBe('password123');
    expect(payload.password_hash).toMatch(/^[a-f0-9]{32}:[a-f0-9]{64}$/);
  });

  it('signin gagal jika password salah', async () => {
    const { signInUser, hashPassword } = await import('@/lib/supabase/auth');
    const salt = 'abc123';
    const correctHash = await hashPassword('password123', salt);
    mockMaybeSingle.mockResolvedValueOnce({
      data: { id: 'u1', username: 'kurir911', password_hash: `${salt}:${correctHash}` },
      error: null,
    });

    const res = await signInUser('Kurir-911', 'password Salah');
    expect(res.success).toBe(false);
    expect(res.error).toContain('salah');
  });

  it('signin berhasil dengan password benar dan menyimpan sesi', async () => {
    const { signInUser, hashPassword } = await import('@/lib/supabase/auth');
    const salt = 'abc123';
    const correctHash = await hashPassword('password123', salt);
    mockMaybeSingle.mockResolvedValueOnce({
      data: { id: 'u1', username: 'kurir911', password_hash: `${salt}:${correctHash}` },
      error: null,
    });

    const res = await signInUser('Kurir-911', 'password123');
    expect(res.success).toBe(true);
    expect(res.user?.username).toBe('Kurir-911');
    expect(res.user?.id).toBe('u1');
  });

  it('hashPassword deterministik dengan salt sama', async () => {
    const { hashPassword } = await import('@/lib/supabase/auth');
    const a = await hashPassword('rahasia', 'saltA');
    const b = await hashPassword('rahasia', 'saltA');
    const c = await hashPassword('rahasia', 'saltB');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('signup gagal jika user tidak ditemukan saat signin', async () => {
    const { signInUser } = await import('@/lib/supabase/auth');
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await signInUser('TidakAda', 'password123');
    expect(res.success).toBe(false);
  });
});
