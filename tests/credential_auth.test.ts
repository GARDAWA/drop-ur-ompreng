import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRpc = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => ({
    rpc: mockRpc,
  }),
}));

describe('Custom Credential Auth via RPC (hash tidak pernah keluar DB)', () => {
  beforeEach(() => {
    vi.resetModules();
    mockRpc.mockClear();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  });

  it('signup menolak username duplikat', async () => {
    const { signUpUser } = await import('@/lib/supabase/auth');
    mockRpc.mockResolvedValueOnce({ data: { success: false, error: 'sudah digunakan' }, error: null });

    const res = await signUpUser('Kurir-911', 'password123');
    expect(res.success).toBe(false);
    expect(res.error).toContain('sudah digunakan');
    expect(mockRpc).toHaveBeenCalledWith('register_player', expect.any(Object));
  });

  it('signup memanggil RPC dengan hash (bukan plaintext)', async () => {
    const { signUpUser } = await import('@/lib/supabase/auth');
    mockRpc.mockResolvedValueOnce({ data: { success: true, id: 'uuid-1' }, error: null });

    const res = await signUpUser('Kurir-911', 'password123');
    expect(res.success).toBe(true);

    const args = mockRpc.mock.calls[0][1];
    expect(args.p_username).toBe('kurir911');
    expect(args.p_password_hash).toMatch(/^[a-f0-9]{32}:[a-f0-9]{64}$/);
    expect(args.p_password_hash).not.toContain('password123');
  });

  it('signin gagal jika password salah (server return false)', async () => {
    const { signInUser } = await import('@/lib/supabase/auth');
    mockRpc
      .mockResolvedValueOnce({ data: 'salt123', error: null }) // get_player_salt
      .mockResolvedValueOnce({ data: { success: false }, error: null }); // authenticate_player

    const res = await signInUser('Kurir-911', 'password salah');
    expect(res.success).toBe(false);
    expect(res.error).toContain('salah');
    expect(mockRpc).toHaveBeenCalledWith('get_player_salt', { p_username: 'kurir911' });
    expect(mockRpc).toHaveBeenLastCalledWith('authenticate_player', expect.any(Object));
  });

  it('signin gagal jika username tidak ada', async () => {
    const { signInUser } = await import('@/lib/supabase/auth');
    mockRpc.mockResolvedValueOnce({ data: null, error: null });
    const res = await signInUser('TidakAda', 'password123');
    expect(res.success).toBe(false);
  });

  it('signin berhasil menyimpan sesi', async () => {
    const { signInUser, hashPassword } = await import('@/lib/supabase/auth');
    const salt = 'salt123';
    const realHash = await hashPassword('password123', salt);
    mockRpc
      .mockResolvedValueOnce({ data: salt, error: null })
      .mockResolvedValueOnce({ data: { success: true, id: 'uuid-1' }, error: null });

    const res = await signInUser('Kurir-911', 'password123');
    expect(res.success).toBe(true);
    expect(res.user?.id).toBe('uuid-1');
    expect(res.user?.username).toBe('Kurir-911');

    const authArgs = mockRpc.mock.calls[1][1];
    expect(authArgs.p_password_hash).toBe(`${salt}:${realHash}`);
  });

  it('hashPassword deterministik dengan salt sama', async () => {
    const { hashPassword } = await import('@/lib/supabase/auth');
    const a = await hashPassword('rahasia', 'saltA');
    const b = await hashPassword('rahasia', 'saltA');
    const c = await hashPassword('rahasia', 'saltB');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('signup gagal jika RPC error', async () => {
    const { signUpUser } = await import('@/lib/supabase/auth');
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'db down' } });

    const res = await signUpUser('Kurir-911', 'password123');
    expect(res.success).toBe(false);
  });
});
