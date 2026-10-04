import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SupabaseRealtimeService } from '../src/services/SupabaseRealtimeService';

describe('SupabaseRealtimeService Online Multiplayer', () => {
  let service: SupabaseRealtimeService;

  beforeEach(() => {
    service = new SupabaseRealtimeService();
  });

  afterEach(() => {
    service.destroy();
  });

  it('creates room with valid MBG code format and sets up host player state', async () => {
    const code = await service.createRoom('Budi Kurir');
    expect(code).toMatch(/^MBG-\d{3,4}$/);
    expect(service.getCurrentRoomId()).toBe(code);
    expect(service.getLocalPlayerId()).toBeDefined();

    let players: any[] = [];
    service.onPlayerListUpdate((list) => {
      players = list;
    });

    expect(players.length).toBe(1);
    expect(players[0].name).toBe('Budi Kurir');
    expect(players[0].isHost).toBe(true);
    expect(players[0].isReady).toBe(false);
  });

  it('toggles ready state correctly', async () => {
    await service.createRoom('Siti Kurir');

    let players: any[] = [];
    service.onPlayerListUpdate((list) => {
      players = list;
    });

    expect(players[0].isReady).toBe(false);

    service.setReady(true);
    expect(players[0].isReady).toBe(true);

    service.setReady(false);
    expect(players[0].isReady).toBe(false);
  });

  it('triggers startMatch listener when host starts race', async () => {
    await service.createRoom('Agus Kurir');

    let started = false;
    service.onMatchStart(() => {
      started = true;
    });

    service.startMatch();
    expect(started).toBe(true);
  });

  it('records finish time and handles broadcastReplay reset', async () => {
    await service.createRoom('Dewi Kurir');

    let finishedPlayerId = '';
    let recordedTime = 0;
    service.onPlayerFinish((id, time) => {
      finishedPlayerId = id;
      recordedTime = time;
    });

    service.broadcastFinish(18.45);
    expect(finishedPlayerId).toBe(service.getLocalPlayerId());
    expect(recordedTime).toBe(18.45);

    let replayTriggered = false;
    service.onReplay(() => {
      replayTriggered = true;
    });

    service.broadcastReplay();
    expect(replayTriggered).toBe(true);

    let players: any[] = [];
    service.onPlayerListUpdate((list) => {
      players = list;
    });

    expect(players[0].finished).toBe(false);
    expect(players[0].finishTime).toBeUndefined();
    expect(players[0].isReady).toBe(false);
  });
});
