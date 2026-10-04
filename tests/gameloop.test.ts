import { describe, it, expect, vi } from 'vitest';
import { Camera } from '../src/game/core/Camera';
import { GameLoop } from '../src/game/core/GameLoop';

describe('Camera', () => {
  it('should follow target with horizontal offset', () => {
    const camera = new Camera();
    camera.update(1000, 800);
    // Player target is kept at 1/3 viewport
    expect(camera.offsetX).toBe(1000 - 800 / 3);
  });

  it('should not scroll negative offset', () => {
    const camera = new Camera();
    camera.update(100, 800);
    expect(camera.offsetX).toBe(0);
  });

  it('should apply screen shake when triggered and decay over time', () => {
    const camera = new Camera();
    camera.triggerShake(15, 0.25);
    camera.update(1000, 800, 0.05);
    expect(camera.shakeX !== 0 || camera.shakeY !== 0).toBe(true);

    // After shake duration expires
    camera.update(1000, 800, 0.3);
    expect(camera.shakeX).toBe(0);
    expect(camera.shakeY).toBe(0);
  });
});

describe('GameLoop Finish Handling', () => {
  it('automatically finishes when player crosses finishX line', () => {
    let finishedTime: number | null = null;
    const loop = new GameLoop({
      onFinish: (time) => {
        finishedTime = time;
      },
    });

    loop.start();
    expect(loop.isRunning).toBe(true);
    expect(loop.isFinished).toBe(false);

    // Place player right at the finish line
    loop.player.x = loop.level.finishX;
    loop.update(0.1, { left: false, right: false });

    expect(loop.isFinished).toBe(true);
    expect(loop.isRunning).toBe(false);
    expect(finishedTime).toBeCloseTo(0.1);
  });

  it('freezes player and time elapsed once finished', () => {
    const loop = new GameLoop();
    loop.start();
    loop.player.x = loop.level.finishX + 50;
    loop.update(0.1, { left: false, right: false });

    expect(loop.isFinished).toBe(true);
    const finalX = loop.player.x;
    const finalTime = loop.timeElapsed;

    // Subsequent updates should not change position or time
    loop.update(1.0, { left: false, right: true });
    expect(loop.player.x).toBe(finalX);
    expect(loop.timeElapsed).toBe(finalTime);
  });

  it('triggers onPickup and applies boost/shield when player runs into pickup', () => {
    let collected: string | null = null;
    const loop = new GameLoop({
      onPickup: (type) => {
        collected = type;
      },
    });

    loop.start();
    // Milk is placed at x=500, groundLevelY = 370
    // Put player right at x=500, y=400 (grounded)
    loop.player.x = 490;
    loop.player.y = 400;
    loop.player.nitroGauge = 20;

    loop.update(0.016, { left: false, right: false });

    expect(collected).toBe('milk');
    // +25 nitro added + passive 0.04 regen
    expect(loop.player.nitroGauge).toBeCloseTo(45.04, 1);
  });

  it('triggers onNearMiss and awards nitro when airborne closely above obstacle', () => {
    let nearMissTriggered = false;
    const loop = new GameLoop({
      onNearMiss: () => {
        nearMissTriggered = true;
      },
    });

    loop.start();
    // Rock is at x=1350, y=362, width=44, height=38
    // Player is airborne: jump above it with clearance within 50px
    loop.player.x = 1350;
    loop.player.y = 330; // player bottom is 330, rock top is 362, gap = 32px
    loop.player.isGrounded = false;
    loop.player.nitroGauge = 10;

    loop.update(0.016, { left: false, right: false });

    expect(nearMissTriggered).toBe(true);
    // +15 nitro added + passive 0.04 regen
    expect(loop.player.nitroGauge).toBeCloseTo(25.04, 1);
  });
});

