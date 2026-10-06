import { getSupabaseClient } from './client';

export interface AuthResult {
  success: boolean;
  user?: { id: string; username: string };
  error?: string;
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function signUpUser(username: string, password: string): Promise<AuthResult> {
  const cleanUsername = username.trim();
  if (!cleanUsername || cleanUsername.length < 3) return { success: false, error: 'Username minimal 3 karakter!' };
  if (!password || password.length < 6) return { success: false, error: 'Password minimal 6 karakter!' };

  const normalizedUser = cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || `u${Date.now()}`;
  const salt = generateSalt();
  const hashedPassword = await hashPassword(password, salt);
  const passwordHash = `${salt}:${hashedPassword}`;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('register_player', {
      p_username: normalizedUser,
      p_password_hash: passwordHash,
    });

    if (error) return { success: false, error: error.message };

    const result = data as { success: boolean; id?: string; error?: string };
    if (!result.success) return { success: false, error: result.error || 'Pendaftaran gagal.' };

    const userId = result.id || `u_${normalizedUser}`;
    persistSession(cleanUsername, userId);
    return { success: true, user: { id: userId, username: cleanUsername } };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Pendaftaran gagal.' };
  }
}

export async function signInUser(username: string, password: string): Promise<AuthResult> {
  const cleanUsername = username.trim();
  if (!cleanUsername) return { success: false, error: 'Masukkan username kamu!' };
  if (!password) return { success: false, error: 'Masukkan password kamu!' };

  const normalizedUser = cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

  try {
    const supabase = getSupabaseClient();

    // Ambil salt profil (bukan hash penuh) lalu hash password lokal
    const { data: saltData, error: saltError } = await supabase.rpc('get_player_salt', {
      p_username: normalizedUser,
    });
    if (saltError || !saltData) {
      return { success: false, error: 'Username atau password salah! Belum punya akun? Klik Daftar.' };
    }

    const salt = saltData as string;
    const hashed = await hashPassword(password, salt);

    const { data, error } = await supabase.rpc('authenticate_player', {
      p_username: normalizedUser,
      p_password_hash: `${salt}:${hashed}`,
    });

    if (error) return { success: false, error: error.message };

    const result = data as { success: boolean; id?: string };
    if (!result.success) return { success: false, error: 'Username atau password salah!' };

    const userId = result.id || `u_${normalizedUser}`;
    persistSession(cleanUsername, userId);
    return { success: true, user: { id: userId, username: cleanUsername } };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Login gagal.' };
  }
}

export async function signInAsGuest(guestName?: string): Promise<AuthResult> {
  const num = Math.floor(1000 + Math.random() * 9000);
  const name = guestName?.trim() || `Guest_${num}`;
  const id = `guest_${num}`;
  persistSession(name, id);
  return { success: true, user: { id, username: name } };
}

export async function getActiveSession(): Promise<{ id: string; username: string } | null> {
  if (typeof window === 'undefined') return null;
  const name = localStorage.getItem('player_name') || sessionStorage.getItem('player_name');
  const id = localStorage.getItem('player_auth_id') || sessionStorage.getItem('player_auth_id');
  if (name && id) return { id, username: name };
  return null;
}

function persistSession(username: string, id: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('player_name', username);
    localStorage.setItem('player_auth_id', id);
    sessionStorage.setItem('player_name', username);
    sessionStorage.setItem('player_auth_id', id);
  }
}
