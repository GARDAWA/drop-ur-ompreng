import { getSupabaseClient } from './client';

export interface LeaderboardEntry {
  id?: string;
  user_id?: string;
  username: string;
  best_time: number;
  created_at?: string;
}

export async function submitScore(username: string, timeSeconds: number, userId?: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const cleanUser = username.trim() || 'Kurir MBG';
    const cleanTime = Number(timeSeconds.toFixed(2));

    // Check personal record to only update if new score is faster
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('id, best_time')
      .eq('username', cleanUser)
      .maybeSingle();

    if (existing) {
      if (cleanTime < Number(existing.best_time)) {
        await supabase
          .from('leaderboard')
          .update({ best_time: cleanTime, user_id: userId || null })
          .eq('id', existing.id);
      }
      return true;
    }

    const { error } = await supabase.from('leaderboard').insert({
      username: cleanUser,
      best_time: cleanTime,
      user_id: userId || null,
    });
    if (error) {
      console.warn('Leaderboard submission warning:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function getTopLeaderboard(limitCount: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('best_time', { ascending: true })
      .limit(limitCount);

    if (error || !data) {
      return [];
    }
    return data as LeaderboardEntry[];
  } catch {
    return [];
  }
}
