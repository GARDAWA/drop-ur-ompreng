import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../src/game/entities/Player';
import { PowerUpManager } from '../src/game/level/PowerUpManager';
import { Pickup } from '../src/game/entities/Pickup';

describe('Nitro, Shield & Power-up Systems', () => {
  let player: Player;
  let powerUpManager: PowerUpManager;

  beforeEach(() => {
    player = new Player({ startX: 100, groundY: 400 });
    powerUpManager = new PowerUpManager({ groundY: 400 });
  });

  it('initializes with starting Nitro gauge', () => {
    expect(player.nitroGauge).toBeGreaterThanOrEqual(25);
    expect(player.nitroGauge).toBeLessThanOrEqual(100);
  });

  it('activates Nitro boost when boost input is true and gauge is available', () => {
    const initialSpeed = player.baseSpeed;
    const initialNitro = player.nitroGauge;
    player.update(0.1, { left: false, right: false, boost: true });

    expect(player.isBoosting).toBe(true);
    expect(player.nitroGauge).toBeLessThan(initialNitro); // Depleted
    // Player speed should be amplified by ~1.75x
    const speed = (player.x - 100) / 0.1;
    expect(speed).toBeGreaterThan(initialSpeed * 1.5);
  });

  it('replenishes Nitro when collecting Milk and clamps at 100', () => {
    player.nitroGauge = 50;
    player.addNitro(25);
    expect(player.nitroGauge).toBe(75);

    player.addNitro(50);
    expect(player.nitroGauge).toBe(100);
  });

  it('shield protects player from obstacle penalty completely', () => {
    player.activateShield(3.0);
    expect(player.shieldTimer).toBe(3.0);

    // Try applying a severe penalty (rock/cart)
    player.applyPenalty(0.15, 0.8);
    // Speed modifier must remain 1.0 because shield is active!
    expect(player.speedModifier).toBe(1.0);
  });

  it('detects pickup collection via PowerUpManager', () => {
    const pickup = powerUpManager.pickups[0];
    player.x = pickup.x;
    player.y = 400;

    const collected = powerUpManager.checkCollisions(player);
    expect(collected).toBe(pickup.type);
    expect(pickup.isCollected).toBe(true);
  });

  it('cancels boost and blocks boosting while player is recovering from crash', () => {
    player.nitroGauge = 80;
    // Boosting
    player.update(0.1, { left: false, right: false, boost: true });
    expect(player.isBoosting).toBe(true);

    // Crashes into obstacle without shield
    player.applyPenalty(0.2, 0.6);
    expect(player.isBoosting).toBe(false);
    expect(player.speedModifier).toBe(0.2);

    // Player tries to spam boost while still recovering
    player.update(0.1, { left: false, right: false, boost: true });
    expect(player.isBoosting).toBe(false); // Still blocked!

    // Wait until penalty expires
    player.update(0.55, { left: false, right: false, boost: false });
    expect(player.penaltyTimer).toBe(0);
    expect(player.speedModifier).toBe(1.0);

    // Now boosting works again!
    player.update(0.1, { left: false, right: false, boost: true });
    expect(player.isBoosting).toBe(true);
  });

  it('expires shield over time and restores normal vulnerability', () => {
    player.activateShield(0.2);
    expect(player.shieldTimer).toBe(0.2);

    player.update(0.25, { left: false, right: false, boost: false });
    expect(player.shieldTimer).toBe(0);

    // Now vulnerable to penalties
    player.applyPenalty(0.5, 0.4);
    expect(player.speedModifier).toBe(0.5);
  });
});

