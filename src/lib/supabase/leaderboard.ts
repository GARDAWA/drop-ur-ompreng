import { getSupabaseClient } from './client';

export interface LeaderboardEntry {
  id?: string;
  username: string;
  best_time: number;
  nitro_used?: number;
  stunts_performed?: number;
  pickups_collected?: number;
  created_at?: string;
}

export interface SubmitScoreOptions {
  nitro_used?: number;
  stunts_performed?: number;
  pickups_collected?: number;
}

/**
 * Known mock / seeded dummy bot names from initial tests & placeholder seeds.
 * These are filtered out from public leaderboards so genuine players rank properly.
 */
export const DUMMY_BOT_NAMES = new Set([
  'dewi kurir',
  'test_runner',
  'kurir kilat sppg',
  'bang jago mbg',
  'siti cepat',
  'garuda-1',
  'kurir-mantap',
  'test_up',
  'kurir-juara',
  'kurir-311',
  'kurir-911',
]);

export function isDummyBotName(name: string): boolean {
  if (!name) return true;
  const clean = name.trim().toLowerCase();
  if (DUMMY_BOT_NAMES.has(clean)) return true;
  if (/^test_racer_\d+$/i.test(clean)) return true;
  return false;
}

/**
 * Submit or update race score in Supabase `leaderboard` table.
 * If user beats previous record, inserts new faster time.
 */
export async function submitScore(
  username: string,
  timeSeconds: number,
  userIdOrOptions?: string | SubmitScoreOptions,
  legacyOptions?: SubmitScoreOptions
): Promise<boolean> {
  const options = typeof userIdOrOptions === 'object' ? userIdOrOptions : legacyOptions;

  try {
    const supabase = getSupabaseClient();
    const cleanUser = username.trim() || 'Kurir MBG';
    const cleanTime = Number(timeSeconds.toFixed(2));

    // 1. Check existing personal record
    const { data: existingRecords, error: fetchError } = await supabase
      .from('leaderboard')
      .select('id, player_name, finish_time')
      .ilike('player_name', cleanUser);

    if (fetchError) {
      console.warn('Leaderboard check warning:', fetchError.message);
    }

    if (existingRecords && existingRecords.length > 0) {
      const minTime = Math.min(...existingRecords.map((r) => Number(r.finish_time)));
      if (cleanTime >= minTime) {
        // Player did not beat personal best
        return true;
      }

      // Player beat their record: remove older entries if delete is permitted
      try {
        const oldIds = existingRecords.map((r) => r.id);
        await supabase.from('leaderboard').delete().in('id', oldIds);
      } catch {
        // Non-blocking if table RLS prevents delete
      }
    }

    // 2. Insert new record
    const { error: insertError } = await supabase.from('leaderboard').insert({
      player_name: cleanUser,
      finish_time: cleanTime,
      nitro_used: options?.nitro_used ?? 0,
      stunts_performed: options?.stunts_performed ?? 0,
      pickups_collected: options?.pickups_collected ?? 0,
    });

    if (insertError) {
      console.warn('Leaderboard insert warning:', insertError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Leaderboard submission exception:', err);
    return false;
  }
}

/**
 * Fetch top leaderboard entries ordered by fastest finish_time.
 * Filters out dummy seed bot records and deduplicates by player_name (case-insensitive)
 * so each real human player appears once with their personal best time.
 */
export async function getTopLeaderboard(limitCount: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('finish_time', { ascending: true })
      .limit(100);

    if (error || !data) {
      console.warn('Leaderboard fetch warning:', error?.message);
      return [];
    }

    // Deduplicate and filter out bot / dummy mock records
    const seen = new Set<string>();
    const uniqueList: LeaderboardEntry[] = [];

    for (const row of data) {
      const name = (row.player_name || row.username || 'Kurir MBG').trim();
      const lowerName = name.toLowerCase();

      if (isDummyBotName(name)) {
        continue;
      }

      if (!seen.has(lowerName)) {
        seen.add(lowerName);
        uniqueList.push({
          id: row.id,
          username: name,
          best_time: Number(row.finish_time ?? row.best_time ?? 0),
          nitro_used: row.nitro_used ?? 0,
          stunts_performed: row.stunts_performed ?? 0,
          pickups_collected: row.pickups_collected ?? 0,
          created_at: row.created_at,
        });

        if (uniqueList.length >= limitCount) {
          break;
        }
      }
    }

    return uniqueList;
  } catch (err) {
    console.warn('Leaderboard fetch exception:', err);
    return [];
  }
}
