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
    const { error } = await supabase.from('leaderboard').insert({
      username: username.trim() || 'Kurir MBG',
      best_time: Number(timeSeconds.toFixed(2)),
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
