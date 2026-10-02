import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RemotePlayer } from '../src/game/entities/RemotePlayer';
import { BroadcastChannelService } from '../src/services/BroadcastChannelService';

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

describe('BroadcastChannelService Room & Ready State Management', () => {
  let service: BroadcastChannelService;

  beforeEach(() => {
    service = new BroadcastChannelService();
  });

  afterEach(() => {
    service.destroy();
  });

  it('initializes host and player with isReady = false', async () => {
    const code = await service.createRoom('HostKurir');
    expect(code).toMatch(/^MBG-\d{3}$/);
    expect(service.getCurrentRoomId()).toBe(code);

    let playersList: any[] = [];
    service.onPlayerListUpdate((list) => {
      playersList = list;
    });

    expect(playersList.length).toBe(1);
    expect(playersList[0].isHost).toBe(true);
    // CRITICAL: Must be false when entering room/lobby!
    expect(playersList[0].isReady).toBe(false);
  });

  it('properly toggles ready status with setReady', async () => {
    await service.createRoom('HostKurir');

    let playersList: any[] = [];
    service.onPlayerListUpdate((list) => {
      playersList = list;
    });

    service.setReady(true);
    expect(playersList[0].isReady).toBe(true);

    service.setReady(false);
    expect(playersList[0].isReady).toBe(false);
  });

  it('resets ready state and finished flag on resetMatch and broadcastReplay', async () => {
    await service.createRoom('HostKurir');

    let replayCalled = false;
    service.onReplay(() => {
      replayCalled = true;
    });

    service.setReady(true);
    service.broadcastFinish(15.2);

    let currentPlayers: any[] = [];
    service.onPlayerListUpdate((list) => {
      currentPlayers = list;
    });

    expect(currentPlayers[0].isReady).toBe(true);
    expect(currentPlayers[0].finished).toBe(true);

    service.broadcastReplay();

    expect(replayCalled).toBe(true);
    expect(currentPlayers[0].isReady).toBe(false);
    expect(currentPlayers[0].finished).toBe(false);
    expect(currentPlayers[0].finishTime).toBeUndefined();
    expect(currentPlayers[0].x).toBe(100);
  });

  it('unsubscribes listeners cleanly when cleanup function is invoked', async () => {
    await service.createRoom('HostKurir');

    let callCount = 0;
    const unsub = service.onPlayerListUpdate(() => {
      callCount++;
    });

    expect(callCount).toBe(1); // called once initially

    service.setReady(true);
    expect(callCount).toBe(2);

    unsub();
    service.setReady(false);
    // Should NOT increase because it was unsubscribed
    expect(callCount).toBe(2);
  });
});
