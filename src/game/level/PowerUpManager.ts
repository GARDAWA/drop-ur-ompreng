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
      // Stage 1: Pemanasan Keluar Dapur SPPG
      { x: 500, y: groundLevelY, type: 'milk' },
      { x: 950, y: airJumpY, type: 'milk' }, // High above puddle
      { x: 1200, y: groundLevelY, type: 'fruit' },

      // Stage 2: Area Pasar Tradisional & Pemukiman
      { x: 1600, y: groundLevelY, type: 'milk' },
      { x: 2150, y: airJumpY, type: 'fruit' }, // High above cart
      { x: 2350, y: groundLevelY, type: 'milk' },
      { x: 2750, y: airJumpY, type: 'bento' }, // Rare Golden Bento jump reward!
      { x: 3150, y: groundLevelY, type: 'milk' },

      // Stage 3: Jalur Cepat & Konstruksi
      { x: 3550, y: groundLevelY, type: 'fruit' },
      { x: 4050, y: airJumpY, type: 'milk' }, // High above jumping chicken
      { x: 4400, y: airJumpY, type: 'fruit' }, // Shield above cart!
      { x: 4600, y: groundLevelY, type: 'milk' },

      // Stage 4: Menuju SDN 01 Merdeka
      { x: 4950, y: groundLevelY, type: 'milk' },
      { x: 5200, y: airJumpY, type: 'bento' }, // Final sprint Golden Bento!
      { x: 5500, y: groundLevelY, type: 'milk' },
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
