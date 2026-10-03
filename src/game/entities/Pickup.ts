import { BoundingBox } from '../physics/Collision';

export type PickupType = 'milk' | 'fruit' | 'bento';

export interface PickupConfig {
  x: number;
  y: number;
  type: PickupType;
}

export class Pickup {
  public x: number;
  public y: number;
  public initialY: number;
  public type: PickupType;
  public width: number;
  public height: number;
  public isCollected: boolean = false;
  private animTimer: number = 0;

  constructor(config: PickupConfig) {
    this.x = config.x;
    this.initialY = config.y;
    this.y = config.y;
    this.type = config.type;
    this.animTimer = Math.random() * Math.PI * 2;

    switch (config.type) {
      case 'milk':
        this.width = 30;
        this.height = 36;
        break;
      case 'fruit':
        this.width = 32;
        this.height = 32;
        break;
      case 'bento':
        this.width = 40;
        this.height = 32;
        break;
    }
  }

  public update(deltaSeconds: number): void {
    if (this.isCollected) return;
    this.animTimer += deltaSeconds;
    // Gentle floating bobbing effect
    this.y = this.initialY + Math.sin(this.animTimer * 4) * 6;
  }

  public getBounds(): BoundingBox {
    return {
      x: this.x,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}
