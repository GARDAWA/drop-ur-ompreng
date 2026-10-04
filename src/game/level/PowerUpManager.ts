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
      { x: 1050, y: groundLevelY, type: 'fruit' },
      { x: 1450, y: airJumpY, type: 'milk' }, // Rewarding jump clearance after rock
      { x: 1650, y: groundLevelY, type: 'milk' },

      // Stage 2: Area Pasar Tradisional & Pemukiman
      { x: 2150, y: groundLevelY, type: 'fruit' },
      { x: 2450, y: airJumpY, type: 'bento' }, // Rare Golden Bento high above cart at 2450!
      { x: 2750, y: groundLevelY, type: 'milk' },
      { x: 3000, y: airJumpY, type: 'milk' }, // High above chicken at 3000

      // Stage 3: Jalur Cepat & Konstruksi
      { x: 3550, y: airJumpY, type: 'fruit' }, // Shield above crate at 3550!
      { x: 3850, y: groundLevelY, type: 'milk' },
      { x: 4100, y: airJumpY, type: 'bento' }, // Golden Bento high above rock at 4100!
      { x: 4400, y: groundLevelY, type: 'milk' },

      // Stage 4: Menuju SDN 01 Merdeka
      { x: 4900, y: groundLevelY, type: 'milk' },
      { x: 5150, y: airJumpY, type: 'fruit' }, // Shield above cart at 5150
      { x: 5450, y: airJumpY, type: 'milk' }, // Above chicken at 5450
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
