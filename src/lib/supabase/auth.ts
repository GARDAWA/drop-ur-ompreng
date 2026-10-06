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
 * Register a new user with username and password
 */
export async function signUpUser(username: string, password: string): Promise<AuthResult> {
  const cleanUsername = username.trim();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username minimal 3 karakter!' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter!' };
  }

  const normalizedUser = cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || `user${Date.now()}`;
  const syntheticEmail = `${normalizedUser}@gmail.com`;

  try {
    const supabase = getSupabaseClient();

    // 1. Check duplicate username in profiles table
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', normalizedUser)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'Username sudah digunakan, silakan pilih nama lain atau Sign In!' };
      }
    } catch {
      // Ignore if table RLS restricts manual check
    }

    // 2. Register via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: syntheticEmail,
      password: password,
      options: {
        data: {
          username: cleanUsername,
          display_name: cleanUsername,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        return { success: false, error: 'Username sudah terdaftar! Silakan klik Masuk (Sign In).' };
      }
      return { success: false, error: error.message };
    }

    const userId = data?.user?.id || `u_${normalizedUser}`;

    // 3. Record profile in profiles database
    try {
      await supabase.from('profiles').upsert({
        username: normalizedUser,
        password_hash: 'managed_by_supabase_auth',
      });
    } catch {
      // Non-blocking
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('player_name', cleanUsername);
      localStorage.setItem('player_auth_id', userId);
      sessionStorage.setItem('player_name', cleanUsername);
      sessionStorage.setItem('player_auth_id', userId);
    }

    return {
      success: true,
      user: {
        id: userId,
        username: cleanUsername,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal melakukan pendaftaran.',
    };
  }
}

/**
 * Sign In an existing user with username and password
 */
export async function signInUser(username: string, password: string): Promise<AuthResult> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return { success: false, error: 'Masukkan username kamu!' };
  }
  if (!password) {
    return { success: false, error: 'Masukkan password kamu!' };
  }

  const normalizedUser = cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '') || `user${Date.now()}`;
  const syntheticEmail = `${normalizedUser}@gmail.com`;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: password,
    });

    if (error) {
      return {
        success: false,
        error: error.message.includes('Invalid login')
          ? 'Username atau password salah! Belum punya akun? Klik Daftar.'
          : error.message,
      };
    }

    const userId = data?.user?.id || `u_${normalizedUser}`;
    const displayName = data?.user?.user_metadata?.display_name || cleanUsername;

    if (typeof window !== 'undefined') {
      localStorage.setItem('player_name', displayName);
      localStorage.setItem('player_auth_id', userId);
      sessionStorage.setItem('player_name', displayName);
      sessionStorage.setItem('player_auth_id', userId);
    }

    return {
      success: true,
      user: {
        id: userId,
        username: displayName,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal login.',
    };
  }
}

/**
 * Guest/Anonymous Login
 */
export async function signInAsGuest(username?: string): Promise<AuthResult> {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const guestName = username && username.trim() ? username.trim() : `Guest_${randomNum}`;

  try {
    const supabase = getSupabaseClient();
    try {
      const { data } = await supabase.auth.signInAnonymously({
        options: {
          data: { username: guestName, is_guest: true },
        },
      });
      const id = data?.user?.id || `guest_${randomNum}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('player_name', guestName);
        localStorage.setItem('player_auth_id', id);
        sessionStorage.setItem('player_name', guestName);
        sessionStorage.setItem('player_auth_id', id);
      }
      return { success: true, user: { id, username: guestName } };
    } catch {
      // Fallback
    }

    const id = `guest_${randomNum}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_name', guestName);
      localStorage.setItem('player_auth_id', id);
      sessionStorage.setItem('player_name', guestName);
      sessionStorage.setItem('player_auth_id', id);
    }
    return { success: true, user: { id, username: guestName } };
  } catch {
    const id = `guest_${randomNum}`;
    return { success: true, user: { id, username: guestName } };
  }
}

/**
 * Check if a persistent session exists
 */
export async function getActiveSession(): Promise<{ id: string; username: string } | null> {
  if (typeof window === 'undefined') return null;
  const name = localStorage.getItem('player_name') || sessionStorage.getItem('player_name');
  const id = localStorage.getItem('player_auth_id') || sessionStorage.getItem('player_auth_id');

  if (name && id) {
    return { id, username: name };
  }
  return null;
}
