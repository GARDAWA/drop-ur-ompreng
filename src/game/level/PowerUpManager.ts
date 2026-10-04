import { Pickup, PickupType } from '../entities/Pickup';
import { Player } from '../entities/Player';
import { checkAABB } from '../physics/Collision';

export interface PowerUpManagerConfig {
  groundY: number;
}

export class PowerUpManager {
  public pickups: Pickup[] = [];
  public groundY: number;

  constructor(config: PowerUpManagerConfig) {
    this.groundY = config.groundY;
    this.generatePickups();
  }

  private generatePickups(): void {
    const groundLevelY = this.groundY - 30;
    const airJumpY = this.groundY - 110;

    const coursePickups: { x: number; y: number; type: PickupType }[] = [
      // STAGE 1: Pemanasan Keluar Dapur SPPG (0 - 2.500m)
      { x: 500, y: groundLevelY, type: 'milk' },
      { x: 1050, y: groundLevelY, type: 'fruit' },
      { x: 1450, y: airJumpY, type: 'milk' }, // Rewarding jump clearance after rock at 1350
      { x: 1750, y: groundLevelY, type: 'milk' },
      { x: 2250, y: airJumpY, type: 'bento' }, // Golden Bento reward!

      // STAGE 2: Kawasan Perumahan & Gang Warga (2.500 - 5.500m)
      { x: 2850, y: groundLevelY, type: 'milk' },
      { x: 3250, y: airJumpY, type: 'fruit' }, // Shield above chicken
      { x: 3600, y: groundLevelY, type: 'milk' },
      { x: 4200, y: airJumpY, type: 'milk' },
      { x: 4800, y: groundLevelY, type: 'fruit' },
      { x: 5150, y: airJumpY, type: 'bento' }, // Golden Bento!

      // STAGE 3: Area Pasar Tradisional & Pertokoan (5.500 - 8.500m)
      { x: 5500, y: groundLevelY, type: 'milk' },
      { x: 6100, y: airJumpY, type: 'fruit' },
      { x: 6750, y: groundLevelY, type: 'milk' },
      { x: 7400, y: airJumpY, type: 'milk' },
      { x: 8050, y: groundLevelY, type: 'bento' }, // Golden Bento reward!

      // STAGE 4: Jalur Lintas Cepat Flyover & Konstruksi (8.500 - 11.500m)
      { x: 8800, y: groundLevelY, type: 'milk' },
      { x: 9300, y: airJumpY, type: 'fruit' }, // Shield above cart
      { x: 9950, y: airJumpY, type: 'milk' }, // Above rock
      { x: 10500, y: groundLevelY, type: 'milk' },
      { x: 11100, y: airJumpY, type: 'bento' }, // Golden Bento!

      // STAGE 5: Jalan Protokol Menuju SDN 01 Merdeka (11.500 - 14.000m)
      { x: 11800, y: groundLevelY, type: 'milk' },
      { x: 12400, y: airJumpY, type: 'fruit' },
      { x: 13050, y: groundLevelY, type: 'milk' },
      { x: 13450, y: airJumpY, type: 'milk' },
      { x: 13700, y: airJumpY, type: 'bento' }, // Grand finale Golden Bento!
    ];

    this.pickups = coursePickups.map(
      (item) => new Pickup({ x: item.x, y: item.y, type: item.type })
    );
  }

  public update(deltaSeconds: number): void {
    for (const pickup of this.pickups) {
      pickup.update(deltaSeconds);
    }
  }

  public checkCollisions(player: Player): PickupType | null {
    const playerBounds = player.getBounds();
    let collectedType: PickupType | null = null;

    for (const pickup of this.pickups) {
      if (!pickup.isCollected && checkAABB(playerBounds, pickup.getBounds())) {
        pickup.isCollected = true;
        collectedType = pickup.type;
        break;
      }
    }

    return collectedType;
  }

  public reset(): void {
    for (const pickup of this.pickups) {
      pickup.isCollected = false;
    }
  }
}
