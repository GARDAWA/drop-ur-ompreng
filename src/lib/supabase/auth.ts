import { getSupabaseClient } from './client';

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    username: string;
  };
  error?: string;
}

/**
 * Hash password with SHA-256 + random salt (no Supabase Auth needed).
 * Stored format: "salt:hash" so we can verify without sending password anywhere.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Register a new user with username and password (custom credential auth).
 * NO Supabase Auth emails — direct profiles table insert.
 */
export async function signUpUser(username: string, password: string): Promise<AuthResult> {
  const cleanUsername = username.trim();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username minimal 3 karakter!' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter!' };
  }

  const normalizedUser = cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || `u${Date.now()}`;

  try {
    const supabase = getSupabaseClient();

    // 1. Check duplicate username
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', normalizedUser)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Username sudah digunakan, silakan pilih nama lain atau Masuk (Sign In)!' };
    }

    // 2. Hash password and insert into profiles table
    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);
    const userId = `u_${normalizedUser}`;

    const { error: insertError } = await supabase.from('profiles').insert({
      username: normalizedUser,
      password_hash: `${salt}:${hashedPassword}`,
    });

    if (insertError) {
      if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
        return { success: false, error: 'Username sudah digunakan, silakan pilih nama lain!' };
      }
      return { success: false, error: insertError.message };
    }

    // 3. Persist session
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_name', cleanUsername);
      localStorage.setItem('player_auth_id', userId);
      sessionStorage.setItem('player_name', cleanUsername);
      sessionStorage.setItem('player_auth_id', userId);
    }

    return { success: true, user: { id: userId, username: cleanUsername } };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Pendaftaran gagal.' };
  }
}

/**
 * Sign In with username and password (custom credential auth).
 * NO Supabase Auth — direct profiles table lookup.
 */
export async function signInUser(username: string, password: string): Promise<AuthResult> {
  const cleanUsername = username.trim();
  if (!cleanUsername) return { success: false, error: 'Masukkan username kamu!' };
  if (!password) return { success: false, error: 'Masukkan password kamu!' };

  const normalizedUser = cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

  try {
    const supabase = getSupabaseClient();

    // 1. Lookup profile by username
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, password_hash')
      .eq('username', normalizedUser)
      .maybeSingle();

    if (error || !profile) {
      return { success: false, error: 'Username atau password salah! Belum punya akun? Klik Daftar.' };
    }

    // 2. Verify password hash
    const [salt, storedHash] = (profile.password_hash || '').split(':');
    if (!salt || !storedHash) {
      return { success: false, error: 'Username atau password salah!' };
    }

    const inputHash = await hashPassword(password, salt);
    if (inputHash !== storedHash) {
      return { success: false, error: 'Username atau password salah!' };
    }

    // 3. Persist session
    const userId = profile.id || `u_${normalizedUser}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_name', cleanUsername);
      localStorage.setItem('player_auth_id', userId);
      sessionStorage.setItem('player_name', cleanUsername);
      sessionStorage.setItem('player_auth_id', userId);
    }

    return { success: true, user: { id: userId, username: cleanUsername } };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Login gagal.' };
  }
}

/**
 * Guest/Anonymous login — no password needed.
 */
export async function signInAsGuest(guestName?: string): Promise<AuthResult> {
  const num = Math.floor(1000 + Math.random() * 9000);
  const name = guestName?.trim() ? guestName.trim() : `Guest_${num}`;
  const id = `guest_${num}`;

  if (typeof window !== 'undefined') {
    localStorage.setItem('player_name', name);
    localStorage.setItem('player_auth_id', id);
    sessionStorage.setItem('player_name', name);
    sessionStorage.setItem('player_auth_id', id);
  }

  return { success: true, user: { id, username: name } };
}

/**
 * Restore session from localStorage.
 */
export async function getActiveSession(): Promise<{ id: string; username: string } | null> {
  if (typeof window === 'undefined') return null;
  const name = localStorage.getItem('player_name') || sessionStorage.getItem('player_name');
  const id = localStorage.getItem('player_auth_id') || sessionStorage.getItem('player_auth_id');
  if (name && id) return { id, username: name };
  return null;
}
