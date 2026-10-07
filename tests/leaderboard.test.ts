import { describe, it, expect } from 'vitest';
import { getTopLeaderboard, submitScore } from '@/lib/supabase/leaderboard';

describe('Leaderboard Schema and Service Integration', () => {
  it('fetches leaderboard entries matching real Supabase schema without error', async () => {
    const list = await getTopLeaderboard(5);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);

    const first = list[0];
    expect(first.username).toBeDefined();
    expect(typeof first.username).toBe('string');
    expect(first.best_time).toBeDefined();
    expect(typeof first.best_time).toBe('number');
    expect(first.best_time).toBeGreaterThan(0);
  });

  it('preserves sorting by fastest finish_time', async () => {
    const list = await getTopLeaderboard(10);
    for (let i = 0; i < list.length - 1; i++) {
      expect(list[i].best_time).toBeLessThanOrEqual(list[i + 1].best_time);
    }
  });

  it('submits a score and updates personal best when faster', async () => {
    const testUser = `Kurir_Baru_${Date.now()}`;
    const initialSubmit = await submitScore(testUser, 35.5, { nitro_used: 1, pickups_collected: 2 });
    expect(initialSubmit).toBe(true);

    // Slower time should not overwrite
    const slowerSubmit = await submitScore(testUser, 40.0);
    expect(slowerSubmit).toBe(true);

    const checkSlower = await getTopLeaderboard(50);
    const entrySlower = checkSlower.find((e) => e.username === testUser);
    expect(entrySlower?.best_time).toBe(35.5);

    // Faster time should overwrite
    const fasterSubmit = await submitScore(testUser, 28.2);
    expect(fasterSubmit).toBe(true);

    const checkFaster = await getTopLeaderboard(50);
    const entryFaster = checkFaster.find((e) => e.username === testUser);
    expect(entryFaster?.best_time).toBe(28.2);
  });
});
