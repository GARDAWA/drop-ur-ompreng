import { Application, Container, Sprite, Graphics, Text, TextStyle } from 'pixi.js';
import { GameLoop } from '../core/GameLoop';
import { RemotePlayer } from '../entities/RemotePlayer';
import { AssetFactory } from './AssetFactory';
import { sound } from '../audio/SoundEffects';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: number;
  life: number;
}

export class PixiSceneRenderer {
  private app: Application;
  private gameLoop: GameLoop;
  private stageContainer: Container;

  // Layer containers
  private skyLayer: Container;
  private mountainsLayer: Container;
  private bgLayer: Container;
  private roadLayer: Container;
  private obstacleLayer: Container;
  private entitiesLayer: Container;
  private fxLayer: Container;

  // Entity visual objects
  private playerSprite: Sprite;
  private playerBadge: Text;
  private remoteSprites: Map<string, { sprite: Sprite; badge: Text }> = new Map();
  private obstacleSprites: Sprite[] = [];

  // Particles & Animations
  private particles: Particle[] = [];
  private particleGraphics: Graphics;
  private finishConfettiTriggered: boolean = false;
  private animTimer: number = 0;

  constructor(app: Application, gameLoop: GameLoop) {
    this.app = app;
    this.gameLoop = gameLoop;

    this.stageContainer = new Container();
    this.app.stage.addChild(this.stageContainer);

    this.skyLayer = new Container();
    this.mountainsLayer = new Container();
    this.bgLayer = new Container();
    this.roadLayer = new Container();
    this.obstacleLayer = new Container();
    this.entitiesLayer = new Container();
    this.fxLayer = new Container();

    this.stageContainer.addChild(this.skyLayer);
    this.stageContainer.addChild(this.mountainsLayer);
    this.stageContainer.addChild(this.bgLayer);
    this.stageContainer.addChild(this.roadLayer);
    this.stageContainer.addChild(this.obstacleLayer);
    this.stageContainer.addChild(this.entitiesLayer);
    this.stageContainer.addChild(this.fxLayer);

    this.particleGraphics = new Graphics();
    this.fxLayer.addChild(this.particleGraphics);

    // Setup Local Player Sprite (High-Definition Green Courier)
    const courierTex = AssetFactory.getCourierTexture('green');
    this.playerSprite = new Sprite(courierTex);
    this.playerSprite.anchor.set(0.5, 0.95);
    this.entitiesLayer.addChild(this.playerSprite);

    const badgeStyle = new TextStyle({
      fontSize: 11,
      fontWeight: '900',
      fill: '#fbbf24',
      stroke: { color: '#090d16', width: 3 },
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 6,
        blur: 4,
        color: '#000000',
        distance: 2,
      },
    });
    this.playerBadge = new Text({ text: '🛵 KAMU (MBG)', style: badgeStyle });
    this.playerBadge.anchor.set(0.5, 1.0);
    this.entitiesLayer.addChild(this.playerBadge);

    this.setupStaticEnvironment();
    this.setupObstacleSprites();
  }

  private setupStaticEnvironment(): void {
    const groundY = this.gameLoop.level.groundY;

    // --- 1. MORNING SUNRISE SKY (Dawn over Indonesia) ---
    const skyG = new Graphics();
    // Warm morning gradient bands
    skyG.rect(0, 0, 7600, groundY - 180).fill(0x0f172a); // Deep indigo high sky
    skyG.rect(0, groundY - 180, 7600, 60).fill(0x1e1b4b); // Dark violet
    skyG.rect(0, groundY - 120, 7600, 50).fill(0x312e81); // Royal indigo
    skyG.rect(0, groundY - 70, 7600, 40).fill(0xc2410c); // Warm amber dawn horizon
    skyG.rect(0, groundY - 30, 7600, 30).fill(0xf97316); // Golden orange

    // Glowing Sunrise Sun (x=1100)
    skyG.circle(1100, groundY - 240, 90).fill({ color: 0xfef08a, alpha: 0.15 }); // Outer corona
    skyG.circle(1100, groundY - 240, 60).fill({ color: 0xfde047, alpha: 0.4 }); // Mid corona
    skyG.circle(1100, groundY - 240, 42).fill(0xffedd5); // Bright sun core

    // Fluffy Morning Clouds with warm under-lighting
    for (let x = 120; x < 7400; x += 520) {
      const cy = groundY - 210 + Math.sin(x * 0.005) * 20;
      skyG.ellipse(x, cy, 65, 22).fill({ color: 0x4338ca, alpha: 0.35 });
      skyG.ellipse(x + 24, cy - 8, 48, 20).fill({ color: 0x6366f1, alpha: 0.45 });
      skyG.ellipse(x - 22, cy - 4, 38, 16).fill({ color: 0x818cf8, alpha: 0.4 });
    }
    this.skyLayer.addChild(skyG);

    // --- 2. DISTANT INDONESIAN MOUNTAIN RANGE (Gunung Salak / Merapi silhouette) ---
    const mtnG = new Graphics();
    for (let x = 0; x < 7600; x += 900) {
      // Background mountain layer (Atmospheric haze blue)
      mtnG.moveTo(x - 100, groundY);
      mtnG.lineTo(x + 350, groundY - 190);
      mtnG.lineTo(x + 800, groundY);
      mtnG.closePath();
      mtnG.fill({ color: 0x1e1b4b, alpha: 0.7 });

      // Foreground mountain ridge
      mtnG.moveTo(x + 250, groundY);
      mtnG.lineTo(x + 650, groundY - 140);
      mtnG.lineTo(x + 1050, groundY);
      mtnG.closePath();
      mtnG.fill({ color: 0x312e81, alpha: 0.6 });
    }
    this.mountainsLayer.addChild(mtnG);

    // --- 3. MIDGROUND ARCHITECTURE & ROADSIDE SCENERY ---
    // Start Area: Dapur Pusat Gizi SPPG
    const sppgSprite = new Sprite(AssetFactory.getSPPGBuildingTexture());
    sppgSprite.position.set(10, groundY - 196);
    this.bgLayer.addChild(sppgSprite);

    // Finish Area: SDN 01 Merdeka with Cheering Kids & Flag
    const schoolSprite = new Sprite(AssetFactory.getSchoolFinishTexture());
    schoolSprite.position.set(5640, groundY - 216);
    this.bgLayer.addChild(schoolSprite);

    // Roadside Tropical Palm Trees & Bougainvillea
    for (let x = 380; x < 5500; x += 360) {
      const tree = new Sprite(AssetFactory.getTreeTexture());
      tree.position.set(x, groundY - 156);
      this.bgLayer.addChild(tree);
    }

    // Concrete Utility Poles with Tangled Street Cables (Khas Indonesia)
    for (let x = 250; x < 5600; x += 580) {
      const pole = new Sprite(AssetFactory.getUtilityPoleTexture());
      pole.position.set(x, groundY - 238);
      this.bgLayer.addChild(pole);
    }

    // --- 4. ROAD, SIDEWALK CURBS & ASPHALT ROAD MARKINGS ---
    const roadG = new Graphics();

    // Sidewalk Base
    roadG.rect(0, groundY, 7600, 10).fill(0x334155);

    // Beveled Trotoar Merah-Putih (Indonesian Kerb Stones)
    for (let x = 0; x < 7600; x += 40) {
      const isRed = (x / 40) % 2 === 0;
      // Top face of curb
      roadG.rect(x, groundY, 40, 6).fill(isRed ? 0xef4444 : 0xf8fafc);
      // Front face with shadow
      roadG.rect(x, groundY + 6, 40, 4).fill(isRed ? 0xb91c1c : 0xcbd5e1);
    }

    // High-friction Dark Asphalt Roadbed
    roadG.rect(0, groundY + 10, 7600, 320).fill(0x0f172a); // Deep rich asphalt

    // Asphalt surface texture noise / gravel aggregate
    for (let x = 0; x < 7600; x += 120) {
      roadG.rect(x + 15, groundY + 28, 45, 2).fill({ color: 0x1e293b, alpha: 0.6 });
      roadG.rect(x + 75, groundY + 70, 30, 2).fill({ color: 0x1e293b, alpha: 0.6 });
    }

    // Center Road Dashed Yellow Divider (Marka Jalan Kuning Tebal)
    for (let x = 0; x < 7600; x += 130) {
      // 3D Shadow under yellow stripe
      roadG.rect(x, groundY + 46, 68, 7).fill(0x020617);
      // Bright yellow reflective paint
      roadG.rect(x, groundY + 45, 68, 6).fill(0xfacc15);
    }

    // White Edge Shoulder Line
    roadG.rect(0, groundY + 14, 7600, 3).fill(0xe2e8f0);

    // Special Painted Road Warning Markings on Asphalt
    const drawRoadStencil = (x: number, text: string, icon: string) => {
      const label = new Text({
        text: `${icon} ${text}`,
        style: new TextStyle({
          fontSize: 16,
          fontWeight: '900',
          fill: 'rgba(254, 240, 138, 0.45)', // Faded yellow road paint
          fontFamily: 'Arial, sans-serif',
          letterSpacing: 2,
        }),
      });
      label.position.set(x, groundY + 22);
      this.roadLayer.addChild(label);
    };

    drawRoadStencil(120, 'START ➔ DAPUR SPPG', '🛵');
    drawRoadStencil(1600, 'ZONA PASAR TRADISIONAL', '🍲');
    drawRoadStencil(3500, 'HATI-HATI JALUR CEPAT', '⚠️');
    drawRoadStencil(5100, 'ZONA SEKOLAH 20 KM/H', '🏫');
    drawRoadStencil(5720, 'GARIS FINISH SDN 01', '🏁');

    this.roadLayer.addChild(roadG);
  }

  private setupObstacleSprites(): void {
    for (const obs of this.gameLoop.level.obstacles) {
      let tex;
      switch (obs.type) {
        case 'puddle':
          tex = AssetFactory.getPuddleTexture();
          break;
        case 'speedbump':
          tex = AssetFactory.getSpeedBumpTexture();
          break;
        case 'rock':
          tex = AssetFactory.getRockTexture();
          break;
        case 'cart':
          tex = AssetFactory.getCartTexture();
          break;
        case 'chicken':
          tex = AssetFactory.getChickenTexture();
          break;
        case 'crate':
          tex = AssetFactory.getCrateTexture();
          break;
        default:
          tex = AssetFactory.getRockTexture();
      }

      const sprite = new Sprite(tex);
      // Offset slightly to perfectly frame physics bounding box and ground
      sprite.position.set(obs.x - 6, obs.y - 4);
      this.obstacleLayer.addChild(sprite);
      this.obstacleSprites.push(sprite);
    }
  }

  public render(remotePlayers: Map<string, RemotePlayer>): void {
    const delta = 0.016;
    this.animTimer += delta;
    const camX = this.gameLoop.camera.offsetX;
    const player = this.gameLoop.player;

    // 1. Move camera viewport
    this.stageContainer.x = -camX;

    // 2. Parallax effect for sky and mountains
    this.skyLayer.x = camX * 0.7; // Slow sky scroll
    this.mountainsLayer.x = camX * 0.4; // Mid-distance mountain scroll

    // 3. Sync animated obstacle positions (e.g. hopping chicken)
    const obstacles = this.gameLoop.level.obstacles;
    for (let i = 0; i < obstacles.length; i++) {
      if (this.obstacleSprites[i]) {
        this.obstacleSprites[i].position.set(obstacles[i].x - 6, obstacles[i].y - 4);
      }
    }

    // 4. Animate Local Player (Scooter engine rumble & jumping tilt)
    const engineRumble = player.isGrounded && this.gameLoop.isRunning
      ? Math.sin(this.animTimer * 24) * 1.4
      : 0;

    this.playerSprite.position.set(player.x + 32, player.y + engineRumble);
    this.playerBadge.position.set(player.x + 32, player.y - 66 + engineRumble);

    // Natural forward tilt while moving or jumping
    if (!player.isGrounded) {
      this.playerSprite.rotation = Math.max(-0.25, Math.min(0.2, player.velocityY * 0.0004));
    } else {
      this.playerSprite.rotation = this.gameLoop.isRunning ? 0.015 : 0;
    }

    // Dynamic exhaust smoke & dust particles while running
    if (this.gameLoop.isRunning && player.isGrounded && Math.random() < 0.45) {
      this.particles.push({
        x: player.x + 4,
        y: player.y - 8,
        vx: -(90 + Math.random() * 80),
        vy: -(12 + Math.random() * 20),
        size: 3.5 + Math.random() * 4.5,
        alpha: 0.75,
        color: Math.random() < 0.2 ? 0xf59e0b : 0x94a3b8, // warm exhaust spark
        life: 0.45,
      });
    }

    // 5. Render Remote Players (Ghosts with distinct custom palettes)
    const remotePalette = ['blue', 'red', 'purple'] as const;
    let colorIdx = 0;

    for (const [id, remote] of remotePlayers) {
      let entry = this.remoteSprites.get(id);
      if (!entry) {
        const tex = AssetFactory.getCourierTexture(remotePalette[colorIdx % 3]);
        colorIdx++;
        const sprite = new Sprite(tex);
        sprite.anchor.set(0.5, 0.95);
        this.entitiesLayer.addChild(sprite);

        const badge = new Text({
          text: `🛵 ${remote.name}`,
          style: new TextStyle({
            fontSize: 10,
            fontWeight: '900',
            fill: '#60a5fa',
            stroke: { color: '#090d16', width: 2.5 },
          }),
        });
        badge.anchor.set(0.5, 1.0);
        this.entitiesLayer.addChild(badge);

        entry = { sprite, badge };
        this.remoteSprites.set(id, entry);
      }

      const remoteRumble = Math.sin(this.animTimer * 20) * 1.2;
      entry.sprite.position.set(remote.x + 32, remote.y + remoteRumble);
      entry.badge.position.set(remote.x + 32, remote.y - 64 + remoteRumble);
    }

    // 6. Trigger Finish Confetti Blast at School Gate
    if (this.gameLoop.isFinished && !this.finishConfettiTriggered) {
      this.finishConfettiTriggered = true;
      sound.playWin();

      // Spawn 120 vibrant celebratory confetti particles
      const confettiColors = [0xef4444, 0x3b82f6, 0x10b981, 0xfacc15, 0xa855f7, 0xffffff];
      for (let i = 0; i < 120; i++) {
        this.particles.push({
          x: 5800 + (Math.random() * 120 - 60),
          y: player.y - 90,
          vx: (Math.random() - 0.5) * 520,
          vy: -(160 + Math.random() * 380),
          size: 4 + Math.random() * 6,
          alpha: 1.0,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          life: 2.2,
        });
      }
    }

    // 7. Update and Draw Particles
    this.particleGraphics.clear();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += 260 * delta; // Gravity
      p.life -= delta;
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      } else {
        this.particleGraphics.rect(p.x, p.y, p.size, p.size).fill({ color: p.color, alpha: p.alpha });
      }
    }
  }

  public destroy(): void {
    this.stageContainer.destroy({ children: true });
    this.remoteSprites.clear();
    this.obstacleSprites = [];
    this.particles = [];
  }
}
