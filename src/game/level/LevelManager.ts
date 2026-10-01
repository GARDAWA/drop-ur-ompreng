import { Obstacle } from '../entities/Obstacle';
import { Player } from '../entities/Player';
import { checkAABB } from '../physics/Collision';

export interface LevelConfig {
  groundY: number;
  trackLength?: number;
  finishX?: number;
}

export class LevelManager {
  public groundY: number;
  public trackLength: number;
  public finishX: number;
  public obstacles: Obstacle[] = [];

  constructor(config: LevelConfig) {
    this.groundY = config.groundY;
    this.trackLength = config.trackLength ?? 6000;
    this.finishX = config.finishX ?? 5800;
    this.generateObstacles();
  }

  private generateObstacles(): void {
    // Generate deterministic obstacle course between SPPG (x=500) and School (x=5500)
    const positions = [
      { x: 700, type: 'puddle' as const },
      { x: 1200, type: 'rock' as const },
      { x: 1800, type: 'puddle' as const },
      { x: 2400, type: 'rock' as const },
      { x: 3000, type: 'puddle' as const },
      { x: 3600, type: 'rock' as const },
      { x: 4200, type: 'puddle' as const },
      { x: 4800, type: 'rock' as const },
      { x: 5300, type: 'rock' as const },
    ];

    this.obstacles = positions.map(
      (pos) => new Obstacle({ x: pos.x, groundY: this.groundY, type: pos.type })
    );
  }

  public checkFinish(playerX: number): boolean {
    return playerX >= this.finishX;
  }

  public checkCollisions(player: Player): void {
    const playerBounds = player.getBounds();
    for (const obstacle of this.obstacles) {
      if (!obstacle.isTriggered && checkAABB(playerBounds, obstacle.getBounds())) {
        obstacle.isTriggered = true;
        if (obstacle.type === 'puddle') {
          player.applyPenalty(0.6, 1.0); // 40% slow for 1s
        } else {
          player.applyPenalty(0.2, 0.5); // 80% stop for 0.5s
        }
      }
    }
  }

  public reset(): void {
    for (const obs of this.obstacles) {
      obs.isTriggered = false;
    }
  }
}
