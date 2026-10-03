import { Obstacle, ObstacleType } from '../entities/Obstacle';
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
  public lastCollidedType: ObstacleType | null = null;

  constructor(config: LevelConfig) {
    this.groundY = config.groundY;
    this.trackLength = config.trackLength ?? 6000;
    this.finishX = config.finishX ?? 5800;
    this.generateObstacles();
  }

  private generateObstacles(): void {
    const course: { x: number; type: ObstacleType }[] = [
      // Stage 1: Pemanasan Keluar dari Dapur SPPG
      { x: 650, type: 'speedbump' },
      { x: 950, type: 'puddle' },
      { x: 1350, type: 'rock' },

      // Stage 2: Area Pasar & Perumahan Warga
      { x: 1750, type: 'chicken' },
      { x: 2150, type: 'cart' },
      { x: 2550, type: 'puddle' },
      { x: 2900, type: 'crate' },
      { x: 3300, type: 'speedbump' },

      // Stage 3: Jalur Lintas Cepat & Konstruksi
      { x: 3700, type: 'rock' },
      { x: 4050, type: 'chicken' },
      { x: 4400, type: 'cart' },
      { x: 4750, type: 'puddle' },

      // Stage 4: Menjelang Gerbang Sekolah SDN 01 Merdeka
      { x: 5050, type: 'crate' },
      { x: 5350, type: 'chicken' },
      { x: 5550, type: 'speedbump' },
    ];

    this.obstacles = course.map(
      (item) => new Obstacle({ x: item.x, groundY: this.groundY, type: item.type })
    );
  }

  public update(deltaSeconds: number): void {
    for (const obs of this.obstacles) {
      obs.update(deltaSeconds);
    }
  }

  public checkFinish(playerX: number): boolean {
    return playerX >= this.finishX;
  }

  public checkCollisions(player: Player): ObstacleType | null {
    const playerBounds = player.getBounds();
    let hitType: ObstacleType | null = null;

    for (const obstacle of this.obstacles) {
      if (!obstacle.isTriggered && checkAABB(playerBounds, obstacle.getBounds())) {
        obstacle.isTriggered = true;
        hitType = obstacle.type;
        this.lastCollidedType = obstacle.type;

        switch (obstacle.type) {
          case 'puddle':
            player.applyPenalty(0.6, 0.9);
            break;
          case 'speedbump':
            player.applyPenalty(0.5, 0.6);
            break;
          case 'rock':
            player.applyPenalty(0.2, 0.6);
            break;
          case 'chicken':
            player.applyPenalty(0.4, 0.7);
            break;
          case 'cart':
            player.applyPenalty(0.15, 0.8);
            break;
          case 'crate':
            player.applyPenalty(0.3, 0.6);
            break;
        }
      }
    }

    return hitType;
  }

  public checkNearMiss(player: Player): boolean {
    if (player.isGrounded) return false;
    const playerBounds = player.getBounds();
    const playerBottom = playerBounds.y + playerBounds.height;
    let didNearMiss = false;

    for (const obs of this.obstacles) {
      if (obs.isTriggered || obs.nearMissAwarded) continue;
      const obsBounds = obs.getBounds();

      const horizontalOverlap =
        playerBounds.x < obsBounds.x + obsBounds.width &&
        playerBounds.x + playerBounds.width > obsBounds.x;

      if (horizontalOverlap) {
        const gap = obsBounds.y - playerBottom;
        if (gap >= 0 && gap <= 55) {
          obs.nearMissAwarded = true;
          didNearMiss = true;
          break;
        }
      }
    }
    return didNearMiss;
  }

  public reset(): void {
    for (const obs of this.obstacles) {
      obs.isTriggered = false;
      obs.nearMissAwarded = false;
    }
    this.lastCollidedType = null;
  }
}
