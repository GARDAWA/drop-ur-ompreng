import { Player, InputState } from '../entities/Player';
import { LevelManager } from '../level/LevelManager';
import { PowerUpManager } from '../level/PowerUpManager';
import { PickupType } from '../entities/Pickup';
import { Camera } from './Camera';
import { ObstacleType } from '../entities/Obstacle';

export interface GameLoopCallbacks {
  onTick?: (playerX: number, progressRatio: number, timeElapsed: number, hitType: ObstacleType | null) => void;
  onFinish?: (timeElapsed: number) => void;
  onPickup?: (type: PickupType) => void;
  onNearMiss?: () => void;
}

export class GameLoop {
  public player: Player;
  public level: LevelManager;
  public powerUps: PowerUpManager;
  public camera: Camera;
  public isRunning: boolean = false;
  public isFinished: boolean = false;
  public timeElapsed: number = 0;
  private callbacks: GameLoopCallbacks;

  constructor(callbacks: GameLoopCallbacks = {}) {
    this.player = new Player({ startX: 100, groundY: 400 });
    this.level = new LevelManager({ groundY: 400 });
    this.powerUps = new PowerUpManager({ groundY: 400 });
    this.camera = new Camera();
    this.callbacks = callbacks;
  }

  public start(): void {
    this.isRunning = true;
    this.isFinished = false;
    this.timeElapsed = 0;
    this.player.x = 100;
    this.player.y = 400;
    this.player.velocityY = 0;
    this.player.isGrounded = true;
    this.player.speedModifier = 1.0;
    this.player.nitroGauge = 50;
    this.player.shieldTimer = 0;
    this.player.isBoosting = false;
    this.level.reset();
    this.powerUps.reset();
  }

  public update(deltaSeconds: number, input: InputState, viewportWidth: number = 1000): void {
    if (!this.isRunning || this.isFinished) return;

    this.timeElapsed += deltaSeconds;

    // Update level obstacle animations (e.g. jumping chicken)
    this.level.update(deltaSeconds);

    // Update player movement and physics
    this.player.update(deltaSeconds, input);

    // Collision check
    const hitType = this.level.checkCollisions(this.player);
    if (hitType) {
      const shakePower = hitType === 'cart' ? 18 : hitType === 'rock' ? 15 : 10;
      this.camera.triggerShake(shakePower, 0.25);
    } else {
      // Near miss stunt check when successfully jumping over obstacle!
      const isNearMiss = this.level.checkNearMiss(this.player);
      if (isNearMiss) {
        this.player.addNitro(15);
        if (this.callbacks.onNearMiss) {
          this.callbacks.onNearMiss();
        }
      }
    }

    // PowerUp Pickups
    this.powerUps.update(deltaSeconds);
    const collectedType = this.powerUps.checkCollisions(this.player);
    if (collectedType) {
      if (collectedType === 'milk') {
        this.player.addNitro(25);
      } else if (collectedType === 'fruit') {
        this.player.activateShield(3.5);
      } else if (collectedType === 'bento') {
        this.player.addNitro(100);
        this.player.activateShield(2.5);
      }
      if (this.callbacks.onPickup) {
        this.callbacks.onPickup(collectedType);
      }
    }

    // Camera follow with screen shake
    this.camera.update(this.player.x, viewportWidth, deltaSeconds);

    // Accurate progress from Start (x=100) to Finish (x=5800)
    const startX = 100;
    const finishX = this.level.finishX;
    const progressRatio = Math.max(0, Math.min(1.0, (this.player.x - startX) / (finishX - startX)));

    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.player.x, progressRatio, this.timeElapsed, hitType);
    }

    if (this.level.checkFinish(this.player.x)) {
      this.isFinished = true;
      this.isRunning = false;
      if (this.callbacks.onFinish) {
        this.callbacks.onFinish(this.timeElapsed);
      }
    }
  }
}
