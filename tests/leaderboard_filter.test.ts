import { describe, it, expect } from 'vitest';
import { getTopLeaderboard, submitScore, isDummyBotName } from '@/lib/supabase/leaderboard';

describe('Leaderboard Filtering and Real Player Ranking', () => {
  it('correctly identifies dummy/mock bot entries', () => {
    expect(isDummyBotName('Dewi Kurir')).toBe(true);
    expect(isDummyBotName('Test_Runner')).toBe(true);
    expect(isDummyBotName('Kurir Kilat SPPG')).toBe(true);
    expect(isDummyBotName('Bang Jago MBG')).toBe(true);
    expect(isDummyBotName('Test_Racer_123456')).toBe(true);
    expect(isDummyBotName('satz11')).toBe(false);
    expect(isDummyBotName('Natalino')).toBe(false);
  });

  it('filters out dummy seed accounts so real players like satz11 appear on Top Global', async () => {
    const list = await getTopLeaderboard(5);
    expect(list.length).toBeGreaterThan(0);

    // None of the returned entries should be dummy accounts
    for (const entry of list) {
      expect(isDummyBotName(entry.username)).toBe(false);
    }

    // satz11 is a real player and should now be at the top of the leaderboard
    const usernames = list.map((e) => e.username.toLowerCase());
    expect(usernames).toContain('satz11');
  });

  it('deduplicates case-insensitively and keeps personal best', async () => {
    const list = await getTopLeaderboard(10);
    const seenNames = new Set<string>();

    for (const entry of list) {
      const lower = entry.username.toLowerCase();
      expect(seenNames.has(lower)).toBe(false);
      seenNames.add(lower);
    }
  });
});
