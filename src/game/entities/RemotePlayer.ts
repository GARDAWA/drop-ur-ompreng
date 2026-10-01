export interface RemotePlayerConfig {
  id: string;
  name: string;
  startX: number;
  groundY: number;
}

export class RemotePlayer {
  public id: string;
  public name: string;
  public x: number;
  public y: number;
  public targetX: number;
  public targetY: number;
  public finished: boolean = false;
  public finishTime?: number;

  constructor(config: RemotePlayerConfig) {
    this.id = config.id;
    this.name = config.name;
    this.x = config.startX;
    this.y = config.groundY;
    this.targetX = config.startX;
    this.targetY = config.groundY;
  }

  public setTargetPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  public update(deltaSeconds: number): void {
    const lerpRate = Math.min(1.0, deltaSeconds * 6);
    this.x += (this.targetX - this.x) * lerpRate;
    this.y += (this.targetY - this.y) * lerpRate;
  }
}
