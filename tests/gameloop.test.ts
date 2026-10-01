import { describe, it, expect } from 'vitest';
import { Camera } from '../src/game/core/Camera';

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
