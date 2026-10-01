import { Application, Container, Graphics } from 'pixi.js';
import { GameLoop } from '../core/GameLoop';
import { RemotePlayer } from '../entities/RemotePlayer';

export class PixiSceneRenderer {
  private app: Application;
  private gameLoop: GameLoop;
  private stageContainer: Container;
  private playerGraphic: Graphics;
  private remoteGraphics: Map<string, Graphics> = new Map();
  private obstacleGraphics: Graphics;
  private bgGraphics: Graphics;

  constructor(app: Application, gameLoop: GameLoop) {
    this.app = app;
    this.gameLoop = gameLoop;

    this.stageContainer = new Container();
    this.app.stage.addChild(this.stageContainer);

    this.bgGraphics = new Graphics();
    this.obstacleGraphics = new Graphics();
    this.playerGraphic = new Graphics();

    this.stageContainer.addChild(this.bgGraphics);
    this.stageContainer.addChild(this.obstacleGraphics);
    this.stageContainer.addChild(this.playerGraphic);
  }

  public render(remotePlayers: Map<string, RemotePlayer>): void {
    const camX = this.gameLoop.camera.offsetX;
    const groundY = this.gameLoop.level.groundY;

    // 1. Draw Parallax Background & Road
    this.bgGraphics.clear();
    // Sky
    this.bgGraphics.rect(0, 0, 8000, groundY).fill(0x1a2238);
    // Ground / Road
    this.bgGraphics.rect(0, groundY, 8000, 300).fill(0x282c34);
    // Road dashes
    for (let x = 0; x < 7000; x += 120) {
      this.bgGraphics.rect(x, groundY + 40, 60, 6).fill(0xffd166);
    }
    // SPPG Starting Building
    this.bgGraphics.rect(0, groundY - 120, 200, 120).fill(0xff914d);
    // Finish Gate (School)
    this.bgGraphics.rect(5800, groundY - 150, 20, 150).fill(0xef476f);
    this.bgGraphics.rect(5800, groundY - 150, 180, 40).fill(0x118ab2);

    // 2. Draw Obstacles
    this.obstacleGraphics.clear();
    for (const obs of this.gameLoop.level.obstacles) {
      if (obs.type === 'puddle') {
        this.obstacleGraphics.ellipse(obs.x + 35, obs.y + 8, 35, 8).fill(0x06d6a0);
      } else {
        this.obstacleGraphics.roundRect(obs.x, obs.y, obs.width, obs.height, 6).fill(0x8d99ae);
      }
    }

    // 3. Draw Local Player
    const player = this.gameLoop.player;
    this.playerGraphic.clear();
    // Cart/Scooter Body
    this.playerGraphic.roundRect(player.x, player.y - player.height, player.width, player.height, 8).fill(0xffbe0b);
    // MBG Delivery Box on back
    this.playerGraphic.roundRect(player.x + 4, player.y - player.height - 18, 28, 20, 4).fill(0xff70a6);
    // Wheels
    this.playerGraphic.circle(player.x + 12, player.y, 10).fill(0x111111);
    this.playerGraphic.circle(player.x + player.width - 12, player.y, 10).fill(0x111111);

    // 4. Draw Remote Players
    for (const [id, remote] of remotePlayers) {
      let g = this.remoteGraphics.get(id);
      if (!g) {
        g = new Graphics();
        this.remoteGraphics.set(id, g);
        this.stageContainer.addChild(g);
      }
      g.clear();
      g.roundRect(remote.x, remote.y - 48, 64, 48, 8).fill(0x3a86ff);
      g.roundRect(remote.x + 4, remote.y - 66, 28, 20, 4).fill(0x00b4d8);
      g.circle(remote.x + 12, remote.y, 10).fill(0x111111);
      g.circle(remote.x + 52, remote.y, 10).fill(0x111111);
    }

    // Position stage against camera
    this.stageContainer.x = -camX;
  }

  public destroy(): void {
    this.stageContainer.destroy({ children: true });
    this.remoteGraphics.clear();
  }
}
