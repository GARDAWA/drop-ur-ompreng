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
  boost?: boolean;
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
  public nitroGauge: number = 35; // 0 to 100
  public isBoosting: boolean = false;
  public shieldTimer: number = 0; // seconds remaining

  public penaltyTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private coyoteTimer: number = 0;

  constructor(config: PlayerConfig) {
    this.x = config.startX;
    this.groundY = config.groundY;
    this.y = config.groundY;
    this.baseSpeed = config.baseSpeed ?? 280;
    this.jumpVelocity = config.jumpVelocity ?? -550;
    this.gravity = config.gravity ?? 1200;
  }

  public jump(): void {
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.velocityY = this.jumpVelocity;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    } else {
      // Buffer the jump input for up to 150ms
      this.jumpBufferTimer = 0.15;
    }
  }

  public addNitro(amount: number): void {
    this.nitroGauge = Math.min(100, Math.max(0, this.nitroGauge + amount));
  }

  public activateShield(durationSeconds: number): void {
    this.shieldTimer = Math.max(this.shieldTimer, durationSeconds);
    // Remove existing penalties immediately
    this.speedModifier = 1.0;
    this.penaltyTimer = 0;
  }

  public applyPenalty(factor: number, durationSeconds: number): void {
    // If shield is active, player completely deflects the penalty!
    if (this.shieldTimer > 0) {
      return;
    }

    // Unshielded collision knocks player out of boost
    this.isBoosting = false;

    if (this.penaltyTimer > 0) {
      // Prevent a weaker penalty from speeding up an already heavily penalized player
      this.speedModifier = Math.min(this.speedModifier, factor);
      this.penaltyTimer = Math.max(this.penaltyTimer, durationSeconds);
    } else {
      this.speedModifier = factor;
      this.penaltyTimer = durationSeconds;
    }
  }

  public update(deltaSeconds: number, input: InputState): void {
    // 1. Update shield timer
    if (this.shieldTimer > 0) {
      this.shieldTimer -= deltaSeconds;
      if (this.shieldTimer <= 0) {
        this.shieldTimer = 0;
      }
    }

    // 2. Update penalty timer
    if (this.penaltyTimer > 0) {
      this.penaltyTimer -= deltaSeconds;
      if (this.penaltyTimer <= 0) {
        this.penaltyTimer = 0;
        this.speedModifier = 1.0;
      }
    }

    // 3. Update jump buffering & coyote timers
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= deltaSeconds;
    }

    if (this.isGrounded) {
      this.coyoteTimer = 0.08;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= deltaSeconds;
    }

    // 4. Update Nitro Boost (cannot boost while recovering from penalty)
    let boostMultiplier = 1.0;
    if (input.boost && this.nitroGauge > 0 && this.penaltyTimer <= 0) {
      this.isBoosting = true;
      boostMultiplier = 1.75;
      // Consume 30% nitro per second
      this.nitroGauge = Math.max(0, this.nitroGauge - 30 * deltaSeconds);
    } else {
      this.isBoosting = false;
      // Passive trickle recharge (2.5% per second)
      this.nitroGauge = Math.min(100, this.nitroGauge + 2.5 * deltaSeconds);
    }

    // 5. Horizontal velocity
    let nudge = 0;
    if (input.right) nudge += 40;
    if (input.left) nudge -= 40;

    const currentSpeed = (this.baseSpeed + nudge) * this.speedModifier * boostMultiplier;
    this.x += currentSpeed * deltaSeconds;

    // 6. Vertical physics
    if (!this.isGrounded) {
      this.velocityY += this.gravity * deltaSeconds;
      this.y += this.velocityY * deltaSeconds;

      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isGrounded = true;

        // Check if there was a buffered jump input
        if (this.jumpBufferTimer > 0) {
          this.jump();
        }
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
