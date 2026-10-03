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

  it('should not allow a weaker penalty to overwrite an active severe penalty', () => {
    const player = new Player({ startX: 100, groundY: 400 });
    // Apply severe cart penalty (factor 0.15 for 0.8s)
    player.applyPenalty(0.15, 0.8);
    expect(player.speedModifier).toBe(0.15);

    // Apply mild puddle penalty (factor 0.6 for 0.9s)
    player.applyPenalty(0.6, 0.9);
    // Modifier must NOT speed up to 0.6!
    expect(player.speedModifier).toBe(0.15);
  });

  it('should execute buffered jump when landing', () => {
    const player = new Player({ startX: 100, groundY: 400 });
    player.jump();
    // Simulate jumping into air
    for (let i = 0; i < 20; i++) {
      player.update(0.02, { left: false, right: false });
    }
    expect(player.isGrounded).toBe(false);

    // Press jump right before landing
    player.jump();

    // Fall remaining distance
    while (!player.isGrounded && player.velocityY > 0) {
      player.update(0.02, { left: false, right: false });
    }

    // Upon hitting ground, the buffered jump triggers
    expect(player.velocityY).toBeLessThan(0);
  });
});

