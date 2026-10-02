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

    // Place player right at the finish line (5800)
    loop.player.x = 5800;
    loop.update(0.1, { left: false, right: false });

    expect(loop.isFinished).toBe(true);
    expect(loop.isRunning).toBe(false);
    expect(finishedTime).toBeCloseTo(0.1);
  });

  it('freezes player and time elapsed once finished', () => {
    const loop = new GameLoop();
    loop.start();
    loop.player.x = 5850;
    loop.update(0.1, { left: false, right: false });

    expect(loop.isFinished).toBe(true);
    const finalX = loop.player.x;
    const finalTime = loop.timeElapsed;

    // Subsequent updates should not change position or time
    loop.update(1.0, { left: false, right: true });
    expect(loop.player.x).toBe(finalX);
    expect(loop.timeElapsed).toBe(finalTime);
  });
});
