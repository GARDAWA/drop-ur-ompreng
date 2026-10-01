import { BoundingBox } from '../physics/Collision';

export type ObstacleType = 'puddle' | 'rock';

export interface ObstacleConfig {
  x: number;
  groundY: number;
  type: ObstacleType;
}

export class Obstacle {
  public x: number;
  public y: number;
  public type: ObstacleType;
  public width: number;
  public height: number;
  public isTriggered: boolean = false;

  constructor(config: ObstacleConfig) {
    this.x = config.x;
    this.type = config.type;

    if (config.type === 'puddle') {
      this.width = 70;
      this.height = 16;
      this.y = config.groundY - 8;
    } else {
      this.width = 40;
      this.height = 36;
      this.y = config.groundY - 36;
    }
  }

  public getBounds(): BoundingBox {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
