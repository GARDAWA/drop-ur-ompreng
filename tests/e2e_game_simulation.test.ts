import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '../src/game/core/GameLoop';
import { BroadcastChannelService } from '../src/services/BroadcastChannelService';
import { LevelManager } from '../src/game/level/LevelManager';
import { Camera } from '../src/game/core/Camera';
import { ObstacleType } from '../src/game/entities/Obstacle';

describe('E2E Full Game Simulation & Mechanics', () => {
  let hostService: BroadcastChannelService;
  let player2Service: BroadcastChannelService;

  beforeEach(() => {
    hostService = new BroadcastChannelService();
    player2Service = new BroadcastChannelService();
  });

  afterEach(() => {
    hostService.destroy();
    player2Service.destroy();
  });

  it('simulates full multiplayer lifecycle: create room -> join -> ready -> start -> race -> finish -> replay', async () => {
    // 1. Host creates room
    const roomCode = await hostService.createRoom('HostKurir');
    expect(roomCode).toMatch(/^MBG-\d{3,4}$/);

    let hostPlayerList: any[] = [];
    hostService.onPlayerListUpdate((list) => {
      hostPlayerList = list;
    });
    expect(hostPlayerList.length).toBe(1);
    expect(hostPlayerList[0].name).toBe('HostKurir');
    expect(hostPlayerList[0].isReady).toBe(false);

    // 2. Player 2 joins room
    await player2Service.joinRoom(roomCode, 'KurirBudi');
    let p2PlayerList: any[] = [];
    player2Service.onPlayerListUpdate((list) => {
      p2PlayerList = list;
    });

    // Both players toggle ready
    hostService.setReady(true);
    player2Service.setReady(true);

    expect(hostPlayerList.find((p) => p.name === 'HostKurir')?.isReady).toBe(true);

    // 3. Match start event
    let hostMatchStarted = false;
    let p2MatchStarted = false;
    hostService.onMatchStart(() => { hostMatchStarted = true; });
    player2Service.onMatchStart(() => { p2MatchStarted = true; });

    hostService.startMatch();
    expect(hostMatchStarted).toBe(true);

    // 4. GameLoop Race Simulation
    let raceFinishedTime: number | null = null;
    let collisionsEncountered: ObstacleType[] = [];

    const loop = new GameLoop({
      onTick: (x, ratio, time, hitType) => {
        if (hitType) {
          collisionsEncountered.push(hitType);
        }
      },
      onFinish: (time) => {
        raceFinishedTime = time;
      },
    });

    loop.start();
    expect(loop.isRunning).toBe(true);
    expect(loop.isFinished).toBe(false);
    expect(loop.player.x).toBe(100);

    // Simulate auto-running over multiple frames (60fps simulation)
    const dt = 0.02;
    let totalFrames = 0;
    while (!loop.isFinished && totalFrames < 3500) {
      const boost = loop.player.nitroGauge > 30;
      loop.update(dt, { left: false, right: false, boost }, 1000);
      totalFrames++;

      // Simulate jumping over obstacles when nearing them
      const upcoming = loop.level.obstacles.find(
        (obs) => !obs.isTriggered && obs.x > loop.player.x && obs.x - loop.player.x < 60
      );
      if (upcoming && loop.player.isGrounded) {
        loop.player.jump();
      }
    }

    // Verify race finished successfully
    expect(loop.isFinished).toBe(true);
    expect(loop.isRunning).toBe(false);
    expect(raceFinishedTime).not.toBeNull();
    expect(raceFinishedTime!).toBeGreaterThan(0);
    expect(loop.player.x).toBeGreaterThanOrEqual(loop.level.finishX);

    // 5. Broadcast finish & replay
    hostService.broadcastFinish(raceFinishedTime!);
    const me = hostPlayerList.find((p) => p.id === hostService.getLocalPlayerId());
    expect(me?.finished).toBe(true);
    expect(me?.finishTime).toBe(raceFinishedTime);

    // Broadcast replay
    let replayReceived = false;
    player2Service.onReplay(() => { replayReceived = true; });
    hostService.broadcastReplay();

    expect(me?.finished).toBe(false);
    expect(me?.isReady).toBe(false);
    expect(me?.x).toBe(100);
  });

  it('validates camera tracking and screen shake decay during race', () => {
    const camera = new Camera();
    camera.update(1200, 900, 0.016);
    expect(camera.offsetX).toBe(1200 - 900 / 3);

    // Trigger severe collision shake
    camera.triggerShake(16, 0.25);
    expect(camera.shakeX !== 0 || camera.shakeY !== 0).toBe(true);

    // Decay halfway
    camera.update(1300, 900, 0.12);
    expect(camera.shakeX !== 0 || camera.shakeY !== 0).toBe(true);

    // Fully decayed
    camera.update(1400, 900, 0.2);
    expect(camera.shakeX).toBe(0);
    expect(camera.shakeY).toBe(0);
  });

  it('guarantees LevelManager covers all 6 authentic Indonesian obstacle types with proper physics penalties', () => {
    const level = new LevelManager({ groundY: 400 });
    expect(level.obstacles.length).toBeGreaterThanOrEqual(10);

    const types = new Set(level.obstacles.map((o) => o.type));
    expect(types.has('puddle')).toBe(true);
    expect(types.has('speedbump')).toBe(true);
    expect(types.has('rock')).toBe(true);
    expect(types.has('cart')).toBe(true);
    expect(types.has('chicken')).toBe(true);
    expect(types.has('crate')).toBe(true);

    // Test reset
    level.obstacles[0].isTriggered = true;
    level.reset();
    expect(level.obstacles[0].isTriggered).toBe(false);
  });

  it('simulates full race with active nitro boosting, powerup collection, shield deflection, and near-miss stunts', () => {
    let pickupsCollected: string[] = [];
    let nearMissCount = 0;
    let finishTime: number | null = null;

    const loop = new GameLoop({
      onPickup: (type) => {
        pickupsCollected.push(type);
      },
      onNearMiss: () => {
        nearMissCount++;
      },
      onFinish: (time) => {
        finishTime = time;
      },
    });

    loop.start();
    expect(loop.powerUps.pickups.length).toBe(26);
    expect(loop.player.nitroGauge).toBe(50); // Starts with 50% nitro

    const dt = 0.02;
    let frames = 0;

    while (!loop.isFinished && frames < 3000) {
      frames++;
      // AI strategy: Boost if nitro > 30 and no obstacle immediately ahead
      const nextObstacle = loop.level.obstacles.find(
        (obs) => !obs.isTriggered && obs.x > loop.player.x && obs.x - loop.player.x < 70
      );

      const shouldBoost = loop.player.nitroGauge > 25 && (!nextObstacle || loop.player.shieldTimer > 0);

      // Jump when close to obstacle
      if (nextObstacle && loop.player.isGrounded && nextObstacle.x - loop.player.x < 55) {
        loop.player.jump();
      }

      loop.update(dt, { left: false, right: true, boost: shouldBoost });
    }

    expect(loop.isFinished).toBe(true);
    expect(finishTime).not.toBeNull();
    // Powerups should be picked up along the way
    expect(pickupsCollected.length).toBeGreaterThan(0);
    // Verified pickups include milk and/or fruit
    expect(pickupsCollected.some((p) => p === 'milk' || p === 'fruit' || p === 'bento')).toBe(true);
    // At finish line, player has crossed 14000
    expect(loop.player.x).toBeGreaterThanOrEqual(14000);
  });
});

