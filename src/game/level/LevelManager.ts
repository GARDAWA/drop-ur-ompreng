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
    // 15,000 px track length with finish line at 14,000 px (14.000 meters journey)
    this.trackLength = config.trackLength ?? 15000;
    this.finishX = config.finishX ?? 14000;
    this.generateObstacles();
  }

  private generateObstacles(): void {
    const course: { x: number; type: ObstacleType }[] = [
      // STAGE 1: Pemanasan Keluar dari Dapur SPPG (0 - 2.500m)
      { x: 800, type: 'speedbump' },
      { x: 1350, type: 'rock' }, // Matches unit test rock at 1350
      { x: 1950, type: 'puddle' },

      // STAGE 2: Kawasan Perumahan & Gang Warga (2.500 - 5.500m)
      { x: 2600, type: 'cart' },
      { x: 3250, type: 'chicken' },
      { x: 3900, type: 'crate' },
      { x: 4550, type: 'puddle' },
      { x: 5150, type: 'speedbump' },

      // STAGE 3: Area Pasar Tradisional & Pertokoan (5.500 - 8.500m)
      { x: 5800, type: 'cart' },
      { x: 6450, type: 'chicken' },
      { x: 7100, type: 'rock' },
      { x: 7750, type: 'crate' },
      { x: 8350, type: 'puddle' },

      // STAGE 4: Jalur Lintas Cepat Flyover & Proyek Konstruksi (8.500 - 11.500m)
      { x: 9000, type: 'speedbump' },
      { x: 9650, type: 'cart' },
      { x: 10300, type: 'rock' },
      { x: 10950, type: 'crate' },
      { x: 11550, type: 'chicken' },

      // STAGE 5: Jalan Protokol Menuju Gerbang SDN 01 Merdeka (11.500 - 14.000m)
      { x: 12200, type: 'puddle' },
      { x: 12850, type: 'cart' },
      { x: 13450, type: 'chicken' },
      { x: 13850, type: 'speedbump' },
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
        break;
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
