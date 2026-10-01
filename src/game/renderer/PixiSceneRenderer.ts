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
    this.bgLayer = new Container();
    this.roadLayer = new Container();
    this.obstacleLayer = new Container();
    this.entitiesLayer = new Container();
    this.fxLayer = new Container();

    this.stageContainer.addChild(this.skyLayer);
    this.stageContainer.addChild(this.bgLayer);
    this.stageContainer.addChild(this.roadLayer);
    this.stageContainer.addChild(this.obstacleLayer);
    this.stageContainer.addChild(this.entitiesLayer);
    this.stageContainer.addChild(this.fxLayer);

    this.particleGraphics = new Graphics();
    this.fxLayer.addChild(this.particleGraphics);

    // Setup Local Player Sprite
    const courierTex = AssetFactory.getCourierTexture('green');
    this.playerSprite = new Sprite(courierTex);
    this.playerSprite.anchor.set(0.5, 1.0);
    this.entitiesLayer.addChild(this.playerSprite);

    const badgeStyle = new TextStyle({
      fontSize: 11,
      fontWeight: 'bold',
      fill: '#fbbf24',
      stroke: { color: '#0f172a', width: 3 },
    });
    this.playerBadge = new Text({ text: '🛵 KAMU (MBG)', style: badgeStyle });
    this.playerBadge.anchor.set(0.5, 1.0);
    this.entitiesLayer.addChild(this.playerBadge);

    this.setupStaticEnvironment();
    this.setupObstacleSprites();
  }

  private setupStaticEnvironment(): void {
    const groundY = this.gameLoop.level.groundY;

    // 1. Sky & Sun (Drawn on SkyLayer)
    const skyG = new Graphics();
    // Sky gradient
    skyG.rect(0, 0, 7500, groundY).fill(0x1e1b4b);
    // Morning Sun
    skyG.circle(800, groundY - 260, 50).fill(0xfde047);
    skyG.circle(800, groundY - 260, 70).fill({ color: 0xfef08a, alpha: 0.3 });

    // Distant Clouds
    for (let x = 100; x < 7000; x += 600) {
      skyG.ellipse(x, groundY - 240, 50, 18).fill({ color: 0x6366f1, alpha: 0.4 });
      skyG.ellipse(x + 30, groundY - 250, 35, 22).fill({ color: 0x818cf8, alpha: 0.5 });
    }
    this.skyLayer.addChild(skyG);

    // 2. Midground Scenery (Dapur SPPG, Trees, Houses)
    const sppgSprite = new Sprite(AssetFactory.getSPPGBuildingTexture());
    sppgSprite.position.set(20, groundY - 160);
    this.bgLayer.addChild(sppgSprite);

    // Trees along the track
    for (let x = 400; x < 5500; x += 450) {
      const tree = new Sprite(AssetFactory.getTreeTexture());
      tree.position.set(x, groundY - 140);
      this.bgLayer.addChild(tree);
    }

    // Finish Area: School Building & Cheering Kids
    const schoolSprite = new Sprite(AssetFactory.getSchoolFinishTexture());
    schoolSprite.position.set(5700, groundY - 180);
    this.bgLayer.addChild(schoolSprite);

    // 3. Road & Sidewalk
    const roadG = new Graphics();
    // Sidewalk Curb (Merah Putih Trotoar)
    for (let x = 0; x < 7500; x += 40) {
      roadG.rect(x, groundY, 40, 8).fill((x / 40) % 2 === 0 ? 0xef4444 : 0xf8fafc);
    }
    // Asphalt Road
    roadG.rect(0, groundY + 8, 7500, 300).fill(0x1e293b);
    // Yellow Road Marks (Marka Jalan Putus-Putus)
    for (let x = 0; x < 7500; x += 120) {
      roadG.rect(x, groundY + 45, 60, 6).fill(0xfacc15);
    }
    this.roadLayer.addChild(roadG);
  }

  private setupObstacleSprites(): void {
    const puddleTex = AssetFactory.getPuddleTexture();
    const rockTex = AssetFactory.getRockTexture();

    for (const obs of this.gameLoop.level.obstacles) {
      const tex = obs.type === 'puddle' ? puddleTex : rockTex;
      const sprite = new Sprite(tex);
      if (obs.type === 'puddle') {
        sprite.position.set(obs.x, obs.y + 4);
      } else {
        sprite.position.set(obs.x, obs.y);
      }
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

    // 2. Animate Local Player
    // Bobbing / Riding vibration while moving
    const bounceY = player.isGrounded ? Math.sin(this.animTimer * 20) * 1.5 : 0;
    this.playerSprite.position.set(player.x + 32, player.y + bounceY);
    this.playerBadge.position.set(player.x + 32, player.y - 60 + bounceY);

    // Tilt slightly forward when accelerating
    this.playerSprite.rotation = player.isGrounded ? 0.02 : player.velocityY * 0.0003;

    // Spawn exhaust smoke & dust particles while running on ground
    if (player.isGrounded && Math.random() < 0.4) {
      this.particles.push({
        x: player.x + 8,
        y: player.y - 6,
        vx: -(100 + Math.random() * 80),
        vy: -(10 + Math.random() * 20),
        size: 3 + Math.random() * 4,
        alpha: 0.7,
        color: 0x94a3b8,
        life: 0.4,
      });
    }

    // 3. Render Remote Players (Ghosts)
    const remotePalette = ['blue', 'red', 'purple'] as const;
    let colorIdx = 0;

    for (const [id, remote] of remotePlayers) {
      let entry = this.remoteSprites.get(id);
      if (!entry) {
        const tex = AssetFactory.getCourierTexture(remotePalette[colorIdx % 3]);
        colorIdx++;
        const sprite = new Sprite(tex);
        sprite.anchor.set(0.5, 1.0);
        this.entitiesLayer.addChild(sprite);

        const badge = new Text({
          text: `🛵 ${remote.name}`,
          style: new TextStyle({
            fontSize: 10,
            fontWeight: 'bold',
            fill: '#60a5fa',
            stroke: { color: '#0f172a', width: 2.5 },
          }),
        });
        badge.anchor.set(0.5, 1.0);
        this.entitiesLayer.addChild(badge);

        entry = { sprite, badge };
        this.remoteSprites.set(id, entry);
      }

      const remoteBounce = Math.sin(this.animTimer * 18) * 1.2;
      entry.sprite.position.set(remote.x + 32, remote.y + remoteBounce);
      entry.badge.position.set(remote.x + 32, remote.y - 58 + remoteBounce);
    }

    // 4. Trigger Finish Confetti Blast
    if (this.gameLoop.isFinished && !this.finishConfettiTriggered) {
      this.finishConfettiTriggered = true;
      sound.playWin();

      // Spawn 100 vibrant confetti particles
      const confettiColors = [0xef4444, 0x3b82f6, 0x10b981, 0xfacc15, 0xa855f7, 0xffffff];
      for (let i = 0; i < 100; i++) {
        this.particles.push({
          x: 5800 + (Math.random() * 100 - 50),
          y: player.y - 80,
          vx: (Math.random() - 0.5) * 450,
          vy: -(150 + Math.random() * 350),
          size: 4 + Math.random() * 5,
          alpha: 1.0,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          life: 2.0,
        });
      }
    }

    // 5. Update and Draw Particles
    this.particleGraphics.clear();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += 250 * delta; // particle gravity
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
