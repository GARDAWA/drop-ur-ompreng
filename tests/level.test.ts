import { describe, it, expect } from 'vitest';
import { LevelManager } from '../src/game/level/LevelManager';
import { Player } from '../src/game/entities/Player';

describe('LevelManager', () => {
  it('should initialize track length and finish line', () => {
    const level = new LevelManager({ groundY: 400 });
    expect(level.trackLength).toBe(15000);
    expect(level.finishX).toBe(14000);
  });

  it('should detect finish line crossed', () => {
    const level = new LevelManager({ groundY: 400 });
    expect(level.checkFinish(13999)).toBe(false);
    expect(level.checkFinish(14000)).toBe(true);
    expect(level.checkFinish(14100)).toBe(true);
  });

  it('should trigger obstacle penalty upon collision', () => {
    const level = new LevelManager({ groundY: 400 });
    const player = new Player({ startX: 0, groundY: 400 });

    const obstacle = level.obstacles[0];
    player.x = obstacle.x;
    player.y = 400;

    level.checkCollisions(player);
    expect(player.speedModifier).toBeLessThan(1.0);
  });

  it('should include diverse obstacle types along the track', () => {
    const level = new LevelManager({ groundY: 400 });
    const types = level.obstacles.map((o) => o.type);
    expect(types).toContain('puddle');
    expect(types).toContain('speedbump');
    expect(types).toContain('rock');
    expect(types).toContain('cart');
    expect(types).toContain('chicken');
    expect(types).toContain('crate');
  });

  it('should animate dynamic obstacles over time', () => {
    const level = new LevelManager({ groundY: 400 });
    const chicken = level.obstacles.find((o) => o.type === 'chicken')!;
    const initialY = chicken.y;
    level.update(0.1);
    expect(chicken.y).not.toBe(initialY);
  });
});
