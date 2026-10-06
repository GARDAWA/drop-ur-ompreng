import { getSupabaseClient } from './client';

export interface GuestAuthResult {
  success: boolean;
  user?: {
    id: string;
    username: string;
  };
  error?: string;
}

/**
 * Perform anonymous or credentialed guest sign-in using Supabase
 */
export async function signInAsGuest(username: string, password?: string): Promise<GuestAuthResult> {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || `guest_${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanPassword = password && password.length >= 6 ? password : `mbg_guest_pass_${cleanUsername}`;
  const syntheticEmail = `${cleanUsername}@guest.dropembege.local`;

  try {
    const supabase = getSupabaseClient();

    // Upsert into custom profiles table for permanent player registry
    try {
      await supabase.from('profiles').upsert(
        {
          username: cleanUsername,
          password_hash: cleanPassword,
        },
        { onConflict: 'username' }
      );
    } catch {
      // Non-blocking if table permissions restrict upsert
    }

    // 1. First attempt: Supabase native anonymous sign-in if enabled
    try {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            username: cleanUsername,
            display_name: username.trim(),
          },
        },
      });

      if (!anonError && anonData?.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('player_name', username.trim());
          localStorage.setItem('player_auth_id', anonData.user.id);
          sessionStorage.setItem('player_name', username.trim());
          sessionStorage.setItem('player_auth_id', anonData.user.id);
        }
        return {
          success: true,
          user: {
            id: anonData.user.id,
            username: username.trim(),
          },
        };
      }
    } catch {
      // Fallback to synthetic guest account if signInAnonymously is disabled on project
    }

    // 2. Fallback attempt: Sign in with synthetic credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: cleanPassword,
    });

    if (!signInError && signInData?.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('player_name', username.trim());
        localStorage.setItem('player_auth_id', signInData.user.id);
        sessionStorage.setItem('player_name', username.trim());
        sessionStorage.setItem('player_auth_id', signInData.user.id);
      }
      return {
        success: true,
        user: {
          id: signInData.user.id,
          username: username.trim(),
        },
      };
    }

    // 3. If user doesn't exist yet, automatically sign up the guest
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: syntheticEmail,
      password: cleanPassword,
      options: {
        data: {
          username: cleanUsername,
          display_name: username.trim(),
        },
      },
    });

    if (!signUpError && signUpData?.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('player_name', username.trim());
        localStorage.setItem('player_auth_id', signUpData.user.id);
        sessionStorage.setItem('player_name', username.trim());
        sessionStorage.setItem('player_auth_id', signUpData.user.id);
      }
      return {
        success: true,
        user: {
          id: signUpData.user.id,
          username: username.trim(),
        },
      };
    }

    // If password mismatch on existing account, notify clearly
    if (signInError) {
      return {
        success: false,
        error: signInError.message,
      };
    }

    return {
      success: true,
      user: {
        id: 'guest_local_' + Math.random().toString(36).substring(2, 9),
        username: username.trim(),
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown auth error';
    // Offline resilience: allow continuing as guest offline
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('player_name', username.trim());
    }
    return {
      success: true,
      user: {
        id: 'guest_offline_' + Math.random().toString(36).substring(2, 9),
        username: username.trim(),
      },
      error: msg,
    };
  }
}
