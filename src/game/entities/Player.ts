import { BoundingBox } from '../physics/Collision';

export interface PlayerConfig {
  startX: number;
  groundY: number;
  baseSpeed?: number;
  jumpVelocity?: number;
  gravity?: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
}

export class Player {
  public x: number;
  public y: number;
  public velocityY: number = 0;
  public isGrounded: boolean = true;
  public readonly width: number = 64;
  public readonly height: number = 48;

  public baseSpeed: number;
  public jumpVelocity: number;
  public gravity: number;
  public groundY: number;
  public speedModifier: number = 1.0;
  private penaltyTimer: number = 0;

  constructor(config: PlayerConfig) {
    this.x = config.startX;
    this.groundY = config.groundY;
    this.y = config.groundY;
    this.baseSpeed = config.baseSpeed ?? 280;
    this.jumpVelocity = config.jumpVelocity ?? -550;
    this.gravity = config.gravity ?? 1200;
  }

  public jump(): void {
    if (this.isGrounded) {
      this.velocityY = this.jumpVelocity;
      this.isGrounded = false;
    }
  }

  public applyPenalty(factor: number, durationSeconds: number): void {
    this.speedModifier = factor;
    this.penaltyTimer = durationSeconds;
  }

  public update(deltaSeconds: number, input: InputState): void {
    if (this.penaltyTimer > 0) {
      this.penaltyTimer -= deltaSeconds;
      if (this.penaltyTimer <= 0) {
        this.speedModifier = 1.0;
      }
    }

    let nudge = 0;
    if (input.right) nudge += 40;
    if (input.left) nudge -= 40;

    const currentSpeed = (this.baseSpeed + nudge) * this.speedModifier;
    this.x += currentSpeed * deltaSeconds;

    if (!this.isGrounded) {
      this.velocityY += this.gravity * deltaSeconds;
      this.y += this.velocityY * deltaSeconds;

      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }
  }

  public getBounds(): BoundingBox {
    return {
      x: this.x + 8,
      y: this.y - this.height,
      width: this.width - 16,
      height: this.height - 4,
    };
  }
}
