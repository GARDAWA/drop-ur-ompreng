import { describe, it, expect } from 'vitest';
import { RemotePlayer } from '../src/game/entities/RemotePlayer';

describe('RemotePlayer Interpolation', () => {
  it('should interpolate towards target position smoothly', () => {
    const remote = new RemotePlayer({ id: 'p2', name: 'Kurir Budi', startX: 100, groundY: 400 });
    expect(remote.x).toBe(100);

    remote.setTargetPosition(200, 400);
    remote.update(0.1);
    expect(remote.x).toBeGreaterThan(100);
    expect(remote.x).toBeLessThan(200);
  });
});
