import { describe, it, expect } from 'vitest';
import { checkAABB, BoundingBox } from '../src/game/physics/Collision';
import { Player } from '../src/game/entities/Player';

describe('Collision & Physics', () => {
  it('should detect intersecting bounding boxes', () => {
    const boxA: BoundingBox = { x: 0, y: 0, width: 50, height: 50 };
    const boxB: BoundingBox = { x: 25, y: 25, width: 50, height: 50 };
    const boxC: BoundingBox = { x: 100, y: 100, width: 50, height: 50 };

    expect(checkAABB(boxA, boxB)).toBe(true);
    expect(checkAABB(boxA, boxC)).toBe(false);
  });

  it('should apply gravity and clamp to ground', () => {
    const player = new Player({ startX: 100, groundY: 400 });
    expect(player.y).toBe(400);

    player.jump();
    expect(player.velocityY).toBeLessThan(0);

    // Simulate 0.1s delta
    player.update(0.1, { left: false, right: false });
    expect(player.y).toBeLessThan(400);

    // Simulate falling back down over 2s
    player.update(2.0, { left: false, right: false });
    expect(player.y).toBe(400);
    expect(player.isGrounded).toBe(true);
  });

  it('should auto-run horizontally', () => {
    const player = new Player({ startX: 100, groundY: 400 });
    player.update(1.0, { left: false, right: false });
    expect(player.x).toBeGreaterThan(100);
  });
});
