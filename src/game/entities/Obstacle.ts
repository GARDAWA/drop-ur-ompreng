import { BoundingBox } from '../physics/Collision';

export type ObstacleType = 'puddle' | 'rock' | 'speedbump' | 'cart' | 'chicken' | 'crate';

export interface ObstacleConfig {
  x: number;
  groundY: number;
  type: ObstacleType;
}

export class Obstacle {
  public x: number;
  public y: number;
  public initialY: number;
  public groundY: number;
  public type: ObstacleType;
  public width: number;
  public height: number;
  public isTriggered: boolean = false;
  public nearMissAwarded: boolean = false;
  private animTimer: number = 0;

  constructor(config: ObstacleConfig) {
    this.x = config.x;
    this.type = config.type;
    this.groundY = config.groundY;
    this.animTimer = Math.random() * 5;

    switch (config.type) {
      case 'puddle':
        this.width = 70;
        this.height = 14;
        this.y = config.groundY - 6;
        break;
      case 'speedbump':
        this.width = 64;
        this.height = 16;
        this.y = config.groundY - 14;
        break;
      case 'rock':
        this.width = 44;
        this.height = 38;
        this.y = config.groundY - 38;
        break;
      case 'chicken':
        this.width = 36;
        this.height = 32;
        this.y = config.groundY - 32;
        break;
      case 'crate':
        this.width = 46;
        this.height = 42;
        this.y = config.groundY - 42;
        break;
      case 'cart':
        this.width = 85;
        this.height = 64;
        this.y = config.groundY - 64;
        break;
    }
    this.initialY = this.y;
  }

  public update(deltaSeconds: number): void {
    this.animTimer += deltaSeconds;

    // Ayam kampung meloncat-loncat di jalanan
    if (this.type === 'chicken') {
      const hop = Math.abs(Math.sin(this.animTimer * 5)) * 24;
      this.y = this.initialY - hop;
    }
  }

  public getBounds(): BoundingBox {
    return {
      x: this.x + 4,
      y: this.y,
      width: this.width - 8,
      height: this.height - 2,
    };
  }
}
