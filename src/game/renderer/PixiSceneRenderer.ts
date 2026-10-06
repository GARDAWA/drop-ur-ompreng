import { Application, Container, Sprite, Graphics, Text, TextStyle } from 'pixi.js';
import { GameLoop } from '../core/GameLoop';
import { RemotePlayer } from '../entities/RemotePlayer';
import { AssetFactory } from './AssetFactory';

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
  private shieldSprite: Sprite;
  private nitroFlameSprite: Sprite;
  private remoteSprites: Map<string, { sprite: Sprite; badge: Text }> = new Map();
  private obstacleSprites: Sprite[] = [];
  private pickupSprites: Sprite[] = [];

  // Particles, Animations & Floating Text
  private particles: Particle[] = [];
  private floatingTexts: { textObj: Text; vy: number; life: number }[] = [];
  private particleGraphics: Graphics;
  private finishConfettiTriggered: boolean = false;
  private animTimer: number = 0;

  constructor(app: Application, gameLoop: GameLoop) {
    this.app = app;
    this.gameLoop = gameLoop;
    AssetFactory.init();

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

    // Setup Nitro Flame Sprite (exhaust blast behind scooter)
    const flameTex = AssetFactory.getNitroFlameTexture();
    this.nitroFlameSprite = new Sprite(flameTex);
    this.nitroFlameSprite.anchor.set(1.0, 0.5);
    this.nitroFlameSprite.visible = false;
    this.entitiesLayer.addChild(this.nitroFlameSprite);

    // Setup Local Player Sprite (High-Definition Green Courier)
    const courierTex = AssetFactory.getCourierTexture('green');
    this.playerSprite = new Sprite(courierTex);
    this.playerSprite.anchor.set(0.5, 0.92);
    this.entitiesLayer.addChild(this.playerSprite);

    // Setup Shield Forcefield Sprite (energy bubble around courier)
    const shieldTex = AssetFactory.getShieldBubbleTexture();
    this.shieldSprite = new Sprite(shieldTex);
    this.shieldSprite.anchor.set(0.5, 0.5);
    this.shieldSprite.visible = false;
    this.entitiesLayer.addChild(this.shieldSprite);

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
    this.playerBadge = new Text({ text: '🚗 KAMU (MBG)', style: badgeStyle });
    this.playerBadge.anchor.set(0.5, 1.0);
    this.entitiesLayer.addChild(this.playerBadge);

    this.setupStaticEnvironment();
    this.setupObstacleSprites();
    this.setupPickupSprites();
  }

  private setupStaticEnvironment(): void {
    const groundY = this.gameLoop.level.groundY;

    // --- 1. GLORIOUS INDONESIAN MORNING SUNSHINE SKY ---
    const skyG = new Graphics();
    const skyW = 20000;

    skyG.rect(0, 0, skyW, groundY - 240).fill(0x0284c7);
    skyG.rect(0, groundY - 240, skyW, 70).fill(0x0ea5e9);
    skyG.rect(0, groundY - 170, skyW, 65).fill(0x38bdf8);
    skyG.rect(0, groundY - 105, skyW, 55).fill(0x7dd3fc);
    skyG.rect(0, groundY - 50, skyW, 30).fill(0xfef08a);
    skyG.rect(0, groundY - 20, skyW, 20).fill(0xffedd5);

    skyG.circle(1150, groundY - 260, 110).fill({ color: 0xfde047, alpha: 0.18 });
    skyG.circle(1150, groundY - 260, 75).fill({ color: 0xfef08a, alpha: 0.35 });
    skyG.circle(1150, groundY - 260, 48).fill(0xffffff);

    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      skyG.moveTo(1150, groundY - 260);
      skyG.lineTo(
        1150 + Math.cos(angle) * 160,
        (groundY - 260) + Math.sin(angle) * 160
      );
      skyG.stroke({ color: 0xfef08a, width: 8, alpha: 0.15 });
    }

    for (let x = 80; x < skyW; x += 480) {
      const cy = groundY - 240 + Math.sin(x * 0.004) * 25;
      // Cloud base shadow (soft pastel lilac/blue)
      skyG.ellipse(x, cy + 6, 75, 22).fill({ color: 0xbfdbfe, alpha: 0.6 });
      skyG.ellipse(x + 28, cy - 2, 54, 22).fill({ color: 0xdbeafe, alpha: 0.8 });
      skyG.ellipse(x - 26, cy + 2, 44, 18).fill({ color: 0xdbeafe, alpha: 0.8 });
      // Cloud bright white puffed tops
      skyG.ellipse(x, cy, 68, 20).fill(0xffffff);
      skyG.ellipse(x + 24, cy - 6, 48, 18).fill(0xffffff);
      skyG.ellipse(x - 24, cy - 2, 40, 16).fill(0xffffff);
    }
    this.skyLayer.addChild(skyG);

    // --- 2. MAJESTIC INDONESIAN VOLCANOES (Gunung Salak / Merapi Ridge) ---
    const mtnG = new Graphics();
    for (let x = 0; x < skyW; x += 900) {
      // Tier 1: Far Misty Volcano Peak (Atmospheric haze soft blue)
      mtnG.moveTo(x - 120, groundY - 30);
      mtnG.lineTo(x + 320, groundY - 210);
      mtnG.lineTo(x + 760, groundY - 30);
      mtnG.closePath();
      mtnG.fill({ color: 0x60a5fa, alpha: 0.35 });

      // Tier 2: Mid-Distance Mountain Ridge (Misty royal indigo)
      mtnG.moveTo(x + 220, groundY - 30);
      mtnG.lineTo(x + 600, groundY - 165);
      mtnG.lineTo(x + 1020, groundY - 30);
      mtnG.closePath();
      mtnG.fill({ color: 0x4f46e5, alpha: 0.45 });

      // Tier 3: Near Rolling Foothills (Lush tropical green hills)
      mtnG.moveTo(x + 480, groundY - 30);
      mtnG.lineTo(x + 780, groundY - 95);
      mtnG.lineTo(x + 1150, groundY - 30);
      mtnG.closePath();
      mtnG.fill({ color: 0x15803d, alpha: 0.55 });
    }
    this.mountainsLayer.addChild(mtnG);

    // --- 3. MIDGROUND ARCHITECTURE & AUTHENTIC INDONESIAN ROADSIDE SCENERY ---
    // Sidewalk sits at groundY - 16. All buildings and roadside greenery rest on sidewalk!
    const sidewalkY = groundY - 16;

    // Start Facility: Dapur Pusat Gizi SPPG
    const sppgSprite = new Sprite(AssetFactory.getSPPGBuildingTexture());
    sppgSprite.position.set(10, sidewalkY - 220);
    this.bgLayer.addChild(sppgSprite);

    // Finish Facility: SDN 01 Merdeka
    const finishX = this.gameLoop.level.finishX;
    const totalRenderWidth = finishX + 3000;

    // Indonesian School Finish Destination Gate Building (SDN 01 Merdeka)
    const schoolSprite = new Sprite(AssetFactory.getSchoolFinishTexture());
    schoolSprite.position.set(finishX - 300, sidewalkY - 240);
    this.bgLayer.addChild(schoolSprite);

    // Roadside Indonesian Warung Makan & Toko Kelontong
    const warungLocations = [1200, 2600, 4000, 5400, 6800, 8200, 9600, 11000, 12400];
    warungLocations.forEach((wx, i) => {
      const warung = new Sprite(AssetFactory.getWarungTexture((i % 2 === 0 ? 1 : 2) as 1 | 2));
      warung.position.set(wx, sidewalkY - 180);
      this.bgLayer.addChild(warung);
    });

    // Indonesian Banana Trees (Pohon Pisang)
    const bananaLocations = [600, 1900, 3300, 4700, 6100, 7500, 8900, 10300, 11700, 13100];
    bananaLocations.forEach((bx) => {
      const banana = new Sprite(AssetFactory.getBananaTreeTexture());
      banana.position.set(bx, sidewalkY - 150);
      this.bgLayer.addChild(banana);
    });

    // Roadside Tropical Palm Trees & Bougainvillea
    for (let x = 320; x < finishX - 350; x += 360) {
      if (!warungLocations.some((wx) => Math.abs(x - wx) < 180)) {
        const tree = new Sprite(AssetFactory.getTreeTexture());
        tree.position.set(x, sidewalkY - 170);
        this.bgLayer.addChild(tree);
      }
    }

    // Concrete Utility Poles with Tangled Electrical Wires (PLN Khas Indonesia)
    for (let x = 200; x < finishX - 250; x += 550) {
      const pole = new Sprite(AssetFactory.getUtilityPoleTexture());
      pole.position.set(x, sidewalkY - 250);
      this.bgLayer.addChild(pole);
    }

    // --- 4. SIDEWALK, 3D MERAH-PUTIH CURBS & HIGH-DEFINITION ASPHALT ROAD ---
    const roadG = new Graphics();

    // 4A. Background Sidewalk Base (Paving Block Trotoar Abu-abu di Belakang Jalan)
    roadG.rect(0, groundY - 48, totalRenderWidth, 34).fill(0x94a3b8);
    for (let x = 0; x < totalRenderWidth; x += 30) {
      roadG.rect(x, groundY - 48, 29, 33).fill(0xcbd5e1);
      roadG.rect(x + 1, groundY - 47, 27, 2).fill(0xf1f5f9);
    }

    // Tactile Guiding Tiles (Ubin Kuning Pemandu Tunanetra)
    roadG.rect(0, groundY - 36, totalRenderWidth, 8).fill(0xfacc15);
    for (let x = 0; x < totalRenderWidth; x += 15) {
      roadG.rect(x, groundY - 36, 11, 2).fill(0xeab308);
      roadG.rect(x, groundY - 31, 11, 2).fill(0xeab308);
    }

    // 4B. 3D Merah-Putih Curb Stones (Batu Kerb Trotoar di Batas Jalan)
    for (let x = 0; x < totalRenderWidth; x += 40) {
      const isRed = (x / 40) % 2 === 0;
      // Top face of curb
      roadG.rect(x, groundY - 14, 40, 6).fill(isRed ? 0xef4444 : 0xf8fafc);
      // Front face of curb
      roadG.rect(x, groundY - 8, 40, 6).fill(isRed ? 0xb91c1c : 0xcbd5e1);
    }

    // Curb contact drop shadow onto asphalt
    roadG.rect(0, groundY - 2, totalRenderWidth, 4).fill({ color: 0x0f172a, alpha: 0.55 });

    // 4C. High-Definition Dark Slate Asphalt Roadbed (Scooter & Obstacles Ride Directly Here!)
    roadG.rect(0, groundY - 2, totalRenderWidth, 168).fill(0x272935); // Asphalt dark slate

    // Asphalt surface aggregate speckles / grit texture
    for (let x = 0; x < totalRenderWidth; x += 60) {
      roadG.rect(x + 10, groundY + 18, 18, 1.8).fill({ color: 0x334155, alpha: 0.7 });
      roadG.rect(x + 35, groundY + 50, 22, 1.8).fill({ color: 0x334155, alpha: 0.7 });
      roadG.rect(x + 18, groundY + 95, 20, 1.8).fill({ color: 0x334155, alpha: 0.7 });
      roadG.rect(x + 42, groundY + 128, 24, 1.8).fill({ color: 0x334155, alpha: 0.7 });
    }

    // White Solid Shoulder Line (Garis Tepi Jalan)
    roadG.rect(0, groundY + 8, totalRenderWidth, 4).fill(0xf8fafc);

    // Bold Double Center Yellow Divider (Marka Jalan Kuning Tebal)
    for (let x = 0; x < totalRenderWidth; x += 140) {
      // 3D Shadow under yellow stripe
      roadG.rect(x, groundY + 70, 72, 8).fill(0x090d16);
      roadG.rect(x, groundY + 84, 72, 8).fill(0x090d16);
      // Bright yellow reflective paint
      roadG.rect(x, groundY + 69, 72, 7).fill(0xfacc15);
      roadG.rect(x, groundY + 83, 72, 7).fill(0xfacc15);
    }

    // Authentic Zebra Crossings (Crosswalks across the road)
    const drawZebraCross = (startX: number) => {
      for (let x = startX; x < startX + 130; x += 22) {
        roadG.rect(x, groundY + 4, 14, 150).fill(0x090d16);
        roadG.rect(x, groundY + 2, 14, 148).fill(0xf8fafc);
      }
    };
    drawZebraCross(200); // Dapur SPPG Crosswalk
    drawZebraCross(2600); // Kawasan Warga Crosswalk
    drawZebraCross(5800); // Pasar Tradisional Crosswalk
    drawZebraCross(9000); // Flyover Crosswalk
    drawZebraCross(finishX - 360); // SDN 01 Merdeka School Crosswalk

    // Cast-Iron Manhole Covers (Tutup Got Besi Bulat)
    const drawManhole = (mx: number, my: number) => {
      roadG.circle(mx, my, 14).fill(0x1e293b);
      roadG.circle(mx, my, 12).fill(0x475569);
      roadG.circle(mx, my, 9).fill(0x334155);
      roadG.circle(mx, my, 4).fill(0x1e293b);
    };
    for (let mx = 800; mx < finishX; mx += 1800) {
      drawManhole(mx, groundY + 115);
    }

    // 4D. Lower Roadside Verge & Guardrail (Fills the lower screen completely!)
    // Concrete Drainage Gutter (Saluran U-Ditch dengan Grill Besi)
    roadG.rect(0, groundY + 164, totalRenderWidth, 16).fill(0x334155);
    for (let x = 0; x < totalRenderWidth; x += 18) {
      roadG.rect(x, groundY + 165, 14, 14).fill(0x1e293b);
      roadG.rect(x + 2, groundY + 167, 10, 2).fill(0x475569);
      roadG.rect(x + 2, groundY + 172, 10, 2).fill(0x475569);
    }

    // Lush Fresh Green Roadside Grass Verge
    roadG.rect(0, groundY + 180, totalRenderWidth, 1000).fill(0x15803d);
    for (let x = 0; x < totalRenderWidth; x += 45) {
      roadG.rect(x, groundY + 178, 6, 6).fill(0x22c55e);
      roadG.rect(x + 12, groundY + 177, 5, 7).fill(0x16a34a);
      if (x % 90 === 0) {
        roadG.circle(x + 24, groundY + 189, 3).fill(0xfacc15); // Yellow flower
      } else if (x % 135 === 0) {
        roadG.circle(x + 18, groundY + 196, 2.5).fill(0xf8fafc); // White daisy
      }
    }

    // Steel Highway Guardrail (W-Beam Pembatas Jalan)
    roadG.rect(0, groundY + 170, totalRenderWidth, 8).fill(0x94a3b8);
    roadG.rect(0, groundY + 172, totalRenderWidth, 4).fill(0xe2e8f0);
    for (let x = 0; x < totalRenderWidth; x += 120) {
      roadG.rect(x + 8, groundY + 168, 8, 20).fill(0x475569);
      roadG.rect(x + 10, groundY + 171, 4, 6).fill(0xef4444); // Red reflector
    }

    this.roadLayer.addChild(roadG);

    // Special Painted Road Warning Markings on Asphalt
    const drawRoadStencil = (x: number, text: string, icon: string) => {
      const label = new Text({
        text: `${icon} ${text}`,
        style: new TextStyle({
          fontSize: 16,
          fontWeight: '900',
          fill: '#fde047',
          fontFamily: 'Inter, Arial, sans-serif',
          letterSpacing: 2,
          dropShadow: {
            alpha: 0.8,
            angle: Math.PI / 4,
            blur: 4,
            color: '#090d16',
            distance: 2,
          },
        }),
      });
      label.position.set(x, groundY + 28);
      this.roadLayer.addChild(label);
    };

    drawRoadStencil(160, 'START ➔ DAPUR SPPG MANDIRI', '🚗');
    drawRoadStencil(2600, 'ZONA PERUMAHAN & GANG WARGA', '🏡');
    drawRoadStencil(5800, 'ZONA PASAR TRADISIONAL', '🍲');
    drawRoadStencil(9000, 'JALUR CEPAT FLYOVER & PROYEK', '⚠️');
    drawRoadStencil(11800, 'JALAN PROTOKOL MENUJU SEKOLAH', '🚦');
    drawRoadStencil(finishX - 450, 'ZONA SELAMAT SEKOLAH 20 KM/H', '🏫');
    drawRoadStencil(finishX - 60, 'GARIS FINISH SDN 01 MERDEKA', '🏁');

    // --- 5. GLORIOUS 3D CHECKERED FINISH ARCH AT SCHOOL GATE ---
    const archG = new Graphics();
    const archX = finishX;

    // Left & Right Checkered Truss Pillars
    const pillarPositions = [archX - 60, archX + 100];
    pillarPositions.forEach((px) => {
      // Concrete Pedestal
      archG.rect(px - 14, groundY - 14, 28, 14).fill(0x334155);
      archG.rect(px - 10, groundY - 20, 20, 6).fill(0x64748b);

      // Checkered Steel Pillar (240px tall)
      const pillarH = 240;
      archG.rect(px - 8, groundY - 20 - pillarH, 16, pillarH).fill(0x0f172a);
      for (let py = groundY - 20 - pillarH; py < groundY - 20; py += 16) {
        const isWhite = Math.floor((py - (groundY - 20 - pillarH)) / 16) % 2 === 0;
        archG.rect(px - 7, py, 14, 15).fill(isWhite ? 0xf8fafc : 0x090d16);
      }
      // Top Yellow Warning Beacon Lamp
      archG.circle(px, groundY - 25 - pillarH, 7).fill(0xfacc15);
      archG.circle(px, groundY - 25 - pillarH, 4).fill(0xffffff);
    });

    // Overhead Arch Truss Spanning Road
    const archTopY = groundY - 260;
    archG.rect(archX - 70, archTopY, 180, 36).fill(0x0f172a);
    // Yellow & Black hazard border stripes
    for (let hx = archX - 70; hx < archX + 110; hx += 16) {
      const isYellow = Math.floor((hx - (archX - 70)) / 16) % 2 === 0;
      archG.rect(hx, archTopY, 15, 6).fill(isYellow ? 0xfacc15 : 0x090d16);
      archG.rect(hx, archTopY + 30, 15, 6).fill(isYellow ? 0xfacc15 : 0x090d16);
    }
    // Bold Finish Banner Center Face
    archG.rect(archX - 60, archTopY + 6, 160, 24).fill(0xdc2626);

    this.roadLayer.addChild(archG);

    // Arch Banner Text
    const archLabel = new Text({
      text: '🏁 FINISH - SDN 01 MERDEKA 🏁',
      style: new TextStyle({
        fontSize: 10,
        fontWeight: '900',
        fill: '#ffffff',
        fontFamily: 'Inter, Arial, sans-serif',
        letterSpacing: 1.5,
        dropShadow: {
          alpha: 0.9,
          angle: Math.PI / 4,
          blur: 2,
          color: '#000000',
          distance: 1,
        },
      }),
    });
    archLabel.anchor.set(0.5, 0.5);
    archLabel.position.set(archX + 20, archTopY + 18);
    this.roadLayer.addChild(archLabel);
  }

  private setupObstacleSprites(): void {
    for (const obs of this.gameLoop.level.obstacles) {
      let tex;
      let offsetX = 0;
      let offsetY = 0;

      switch (obs.type) {
        case 'puddle':
          tex = AssetFactory.getPuddleTexture();
          offsetX = -15;
          offsetY = -8;
          break;
        case 'speedbump':
          tex = AssetFactory.getSpeedBumpTexture();
          offsetX = -13;
          offsetY = -6;
          break;
        case 'rock':
          tex = AssetFactory.getRockTexture();
          offsetX = -13;
          offsetY = -12;
          break;
        case 'cart':
          tex = AssetFactory.getCartTexture();
          offsetX = -16;
          offsetY = -14;
          break;
        case 'chicken':
          tex = AssetFactory.getChickenTexture();
          offsetX = -12;
          offsetY = -12;
          break;
        case 'crate':
          tex = AssetFactory.getCrateTexture();
          offsetX = -9;
          offsetY = -10;
          break;
        default:
          tex = AssetFactory.getRockTexture();
          offsetX = -13;
          offsetY = -12;
      }

      const sprite = new Sprite(tex);
      sprite.position.set(obs.x + offsetX, obs.y + offsetY);
      this.obstacleLayer.addChild(sprite);
      this.obstacleSprites.push(sprite);
    }
  }

  private setupPickupSprites(): void {
    for (const pickup of this.gameLoop.powerUps.pickups) {
      let tex;
      switch (pickup.type) {
        case 'milk':
          tex = AssetFactory.getMilkTexture();
          break;
        case 'fruit':
          tex = AssetFactory.getFruitTexture();
          break;
        case 'bento':
          tex = AssetFactory.getBentoTexture();
          break;
      }
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 0.5);
      sprite.position.set(pickup.x + pickup.width / 2, pickup.y + pickup.height / 2);
      this.obstacleLayer.addChild(sprite);
      this.pickupSprites.push(sprite);
    }
  }

  public spawnFloatingText(text: string, color: string, x: number, y: number): void {
    const style = new TextStyle({
      fontSize: 16,
      fontWeight: '900',
      fill: color,
      stroke: { color: '#090d16', width: 3.5 },
      dropShadow: {
        alpha: 0.9,
        angle: Math.PI / 4,
        blur: 3,
        color: '#000000',
        distance: 2,
      },
    });
    const textObj = new Text({ text, style });
    textObj.anchor.set(0.5, 0.5);
    textObj.position.set(x, y);
    this.fxLayer.addChild(textObj);
    this.floatingTexts.push({ textObj, vy: -60, life: 1.2 });
  }

  public spawnPickupVfx(type: string, x: number, y: number): void {
    const colors = type === 'milk'
      ? [0x38bdf8, 0xffffff, 0xfacc15]
      : type === 'fruit'
      ? [0x10b981, 0xef4444, 0x22c55e]
      : [0xfacc15, 0xfef08a, 0xffffff]; // Golden bento

    for (let i = 0; i < 28; i++) {
      this.particles.push({
        x: x + 16,
        y: y + 16,
        vx: (Math.random() - 0.5) * 320,
        vy: (Math.random() - 0.5) * 320,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.6,
      });
    }
  }

  public spawnHitVfx(type: string, x: number, y: number): void {
    if (type === 'puddle') {
      // Muddy splash particles
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: x + 25 + (Math.random() * 20 - 10),
          y: y - 4,
          vx: (Math.random() - 0.5) * 220,
          vy: -(80 + Math.random() * 180),
          size: 3 + Math.random() * 4,
          alpha: 0.85,
          color: Math.random() > 0.4 ? 0x78350f : 0x38bdf8,
          life: 0.5,
        });
      }
    } else if (type === 'chicken') {
      // Feathers scattering
      for (let i = 0; i < 18; i++) {
        this.particles.push({
          x: x + 15,
          y: y - 16,
          vx: (Math.random() - 0.5) * 180,
          vy: -(60 + Math.random() * 140),
          size: 3 + Math.random() * 3,
          alpha: 0.95,
          color: Math.random() > 0.5 ? 0xffffff : 0xb45309,
          life: 0.8,
        });
      }
    } else if (type === 'crate') {
      // Wood splinter chunks
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: x + 18,
          y: y - 20,
          vx: (Math.random() - 0.5) * 240,
          vy: -(70 + Math.random() * 160),
          size: 3 + Math.random() * 4,
          alpha: 0.9,
          color: 0x92400e,
          life: 0.6,
        });
      }
    } else {
      // Sparks & dust (cart, rock, speedbump)
      for (let i = 0; i < 24; i++) {
        this.particles.push({
          x: x + 18,
          y: y - 10,
          vx: (Math.random() - 0.5) * 260,
          vy: -(90 + Math.random() * 190),
          size: 2.5 + Math.random() * 3.5,
          alpha: 1.0,
          color: Math.random() > 0.3 ? 0xf59e0b : 0xef4444,
          life: 0.45,
        });
      }
    }
  }

  public render(remotePlayers: Map<string, RemotePlayer>, deltaSeconds: number = 0.016): void {
    const delta = Math.max(0.001, Math.min(0.1, deltaSeconds));
    this.animTimer += delta;
    const camX = this.gameLoop.camera.offsetX;
    const player = this.gameLoop.player;

    // 1. Move camera viewport with screen shake
    this.stageContainer.x = -camX + this.gameLoop.camera.shakeX;
    this.stageContainer.y = this.gameLoop.camera.shakeY;

    // 2. Parallax effect for sky and mountains
    this.skyLayer.x = camX * 0.75; // Slow sky scroll
    this.mountainsLayer.x = camX * 0.45; // Mid-distance mountain scroll

    // 3. Sync animated obstacle positions (e.g. hopping chicken) with danger pulsing tint
    const obstacles = this.gameLoop.level.obstacles;
    const pulseFactor = 0.85 + Math.sin(this.animTimer * 12) * 0.15;
    for (let i = 0; i < obstacles.length; i++) {
      if (this.obstacleSprites[i]) {
        let offsetX = 0;
        let offsetY = 0;
        switch (obstacles[i].type) {
          case 'puddle': offsetX = -15; offsetY = -8; break;
          case 'speedbump': offsetX = -13; offsetY = -6; break;
          case 'rock': offsetX = -13; offsetY = -12; break;
          case 'cart': offsetX = -16; offsetY = -14; break;
          case 'chicken': offsetX = -12; offsetY = -12; break;
          case 'crate': offsetX = -9; offsetY = -10; break;
          default: offsetX = -13; offsetY = -12;
        }
        this.obstacleSprites[i].position.set(obstacles[i].x + offsetX, obstacles[i].y + offsetY);
        // Subtle pulsing danger brightness for nearby obstacles (< 450px ahead)
        const dist = obstacles[i].x - player.x;
        if (dist > 0 && dist < 450) {
          this.obstacleSprites[i].alpha = 1.0;
          this.obstacleSprites[i].scale.set(1.0 + Math.sin(this.animTimer * 14) * 0.04);
        } else {
          this.obstacleSprites[i].scale.set(1.0);
        }
      }
    }

    // 3b. Sync nutrient pickup positions & floating bobbing with golden glowing aura
    const pickups = this.gameLoop.powerUps.pickups;
    for (let i = 0; i < pickups.length; i++) {
      const p = pickups[i];
      const s = this.pickupSprites[i];
      if (s) {
        if (p.isCollected) {
          s.visible = false;
        } else {
          s.visible = true;
          const bobbing = Math.sin(this.animTimer * 5 + p.x * 0.05) * 5;
          s.position.set(p.x + p.width / 2, p.y + p.height / 2 + bobbing);
          const auraScale = 1.05 + Math.sin(this.animTimer * 8 + p.x) * 0.08;
          s.scale.set(auraScale);
        }
      }
    }

    // 4. Animate Local Player (Scooter engine rumble & jumping tilt)
    const engineRumble = player.isGrounded && this.gameLoop.isRunning
      ? Math.sin(this.animTimer * 26) * 1.3
      : 0;

    this.playerSprite.position.set(player.x + 32, player.y + engineRumble);
    this.playerBadge.position.set(player.x + 32, player.y - 70 + engineRumble);

    // Natural forward tilt while moving or jumping
    if (!player.isGrounded) {
      this.playerSprite.rotation = Math.max(-0.25, Math.min(0.2, player.velocityY * 0.0004));
    } else {
      this.playerSprite.rotation = this.gameLoop.isRunning ? 0.015 : 0;
    }

    // Shield Forcefield Animation
    if (player.shieldTimer > 0) {
      this.shieldSprite.visible = true;
      this.shieldSprite.position.set(player.x + 32, player.y - 36 + engineRumble);
      this.shieldSprite.alpha = 0.75 + Math.sin(this.animTimer * 8) * 0.2;
      this.shieldSprite.scale.set(1 + Math.sin(this.animTimer * 10) * 0.04);
    } else {
      this.shieldSprite.visible = false;
    }

    // Nitro Flame Tail Animation
    if (player.isBoosting) {
      this.nitroFlameSprite.visible = true;
      this.nitroFlameSprite.position.set(player.x - 4, player.y - 18 + engineRumble);
      this.nitroFlameSprite.scale.set(0.95 + Math.random() * 0.35, 0.9 + Math.random() * 0.3);

      // Nitro fiery exhaust sparks trailing behind
      if (Math.random() < 0.75) {
        this.particles.push({
          x: player.x - 12,
          y: player.y - 18 + (Math.random() * 10 - 5),
          vx: -(240 + Math.random() * 200),
          vy: (Math.random() - 0.5) * 80,
          size: 3.5 + Math.random() * 4,
          alpha: 1.0,
          color: Math.random() < 0.5 ? 0x38bdf8 : 0xf59e0b,
          life: 0.35,
        });
      }
    } else {
      this.nitroFlameSprite.visible = false;
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
        color: Math.random() < 0.2 ? 0xf59e0b : 0xe2e8f0, // warm exhaust spark
        life: 0.45,
      });
    }

    // 5. Render Remote Players (Ghosts with deterministic distinct palettes)
    const remotePalette = ['blue', 'red', 'purple'] as const;

    for (const [id, remote] of remotePlayers) {
      let entry = this.remoteSprites.get(id);
      if (!entry) {
        // Deterministic palette choice by hashing player ID so distinct players get distinct colors
        const charSum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const color = remotePalette[charSum % remotePalette.length];
        const tex = AssetFactory.getCourierTexture(color);
        const sprite = new Sprite(tex);
        sprite.anchor.set(0.5, 0.92);
        this.entitiesLayer.addChild(sprite);

        const badge = new Text({
          text: `🚗 ${remote.name}`,
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
      entry.badge.position.set(remote.x + 32, remote.y - 68 + remoteRumble);
    }

    // 6. Trigger Finish Confetti Blast at School Gate
    if (this.gameLoop.isFinished && !this.finishConfettiTriggered) {
      this.finishConfettiTriggered = true;

      // Spawn 140 vibrant celebratory confetti particles
      const confettiColors = [0xef4444, 0x3b82f6, 0x10b981, 0xfacc15, 0xa855f7, 0xffffff];
      for (let i = 0; i < 140; i++) {
        this.particles.push({
          x: this.gameLoop.level.finishX + (Math.random() * 140 - 70),
          y: player.y - 90,
          vx: (Math.random() - 0.5) * 550,
          vy: -(160 + Math.random() * 400),
          size: 4 + Math.random() * 6.5,
          alpha: 1.0,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          life: 2.4,
        });
      }
    }

    // 7. Update and Draw Particles (capped at 250 to ensure 60fps on mobile)
    if (this.particles.length > 250) {
      this.particles.splice(0, this.particles.length - 250);
    }

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

    // 8. Update Floating Stunt/Pickup Notifications
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.textObj.y += ft.vy * delta;
      ft.life -= delta;
      ft.textObj.alpha = Math.max(0, ft.life);
      if (ft.life <= 0) {
        this.fxLayer.removeChild(ft.textObj);
        ft.textObj.destroy();
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public destroy(): void {
    for (const ft of this.floatingTexts) {
      try {
        ft.textObj.destroy();
      } catch {}
    }
    this.floatingTexts = [];
    this.stageContainer.destroy({ children: true });
    this.remoteSprites.clear();
    this.obstacleSprites = [];
    this.pickupSprites = [];
    this.particles = [];
  }
}
