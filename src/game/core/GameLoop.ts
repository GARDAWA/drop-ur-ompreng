import { Player, InputState } from '../entities/Player';
import { LevelManager } from '../level/LevelManager';
import { Camera } from './Camera';

export interface GameLoopCallbacks {
  onTick?: (playerX: number, progressRatio: number, timeElapsed: number) => void;
  onFinish?: (timeElapsed: number) => void;
}

export class GameLoop {
  public player: Player;
  public level: LevelManager;
  public camera: Camera;
  public isRunning: boolean = false;
  public isFinished: boolean = false;
  public timeElapsed: number = 0;
  private callbacks: GameLoopCallbacks;

  constructor(callbacks: GameLoopCallbacks = {}) {
    this.player = new Player({ startX: 100, groundY: 400 });
    this.level = new LevelManager({ groundY: 400 });
    this.camera = new Camera();
    this.callbacks = callbacks;
  }

  public start(): void {
    this.isRunning = true;
    this.isFinished = false;
    this.timeElapsed = 0;
    this.player.x = 100;
    this.player.y = 400;
    this.level.reset();
  }

  public update(deltaSeconds: number, input: InputState, viewportWidth: number = 1000): void {
    if (!this.isRunning || this.isFinished) return;

    this.timeElapsed += deltaSeconds;
    this.player.update(deltaSeconds, input);
    this.level.checkCollisions(this.player);
    this.camera.update(this.player.x, viewportWidth);

    const progressRatio = Math.min(1.0, this.player.x / this.level.finishX);

    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.player.x, progressRatio, this.timeElapsed);
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
