import {
  IMultiplayerService,
  PlayerState,
  PlayerListListener,
  MatchStartListener,
  PositionListener,
  FinishListener,
} from './IMultiplayerService';

type MessagePayload =
  | { type: 'ANNOUNCE'; player: PlayerState }
  | { type: 'STATE_SYNC'; players: PlayerState[] }
  | { type: 'READY_TOGGLE'; playerId: string; isReady: boolean }
  | { type: 'MATCH_START' }
  | { type: 'POSITION'; playerId: string; x: number; y: number }
  | { type: 'FINISH'; playerId: string; finishTime: number }
  | { type: 'LEAVE'; playerId: string };

export class BroadcastChannelService implements IMultiplayerService {
  private channel: BroadcastChannel | null = null;
  private localPlayerId: string = '';
  private players: Map<string, PlayerState> = new Map();

  private playerListListeners: Set<PlayerListListener> = new Set();
  private matchStartListeners: Set<MatchStartListener> = new Set();
  private positionListeners: Set<PositionListener> = new Set();
  private finishListeners: Set<FinishListener> = new Set();

  private throttleTimer: number | null = null;

  public async createRoom(hostName: string): Promise<string> {
    const code = 'MBG-' + Math.floor(100 + Math.random() * 900);
    await this.connectChannel(code, hostName, true);
    return code;
  }

  public async joinRoom(roomId: string, playerName: string): Promise<boolean> {
    await this.connectChannel(roomId, playerName, false);
    return true;
  }

  private async connectChannel(roomId: string, playerName: string, isHost: boolean): Promise<void> {
    this.destroy();
    this.localPlayerId = 'p_' + Math.random().toString(36).substring(2, 9);
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`drop_embege_room_${roomId}`);
    }

    const localPlayer: PlayerState = {
      id: this.localPlayerId,
      name: playerName,
      isHost,
      isReady: isHost,
      x: 100,
      y: 400,
      finished: false,
    };
    this.players.set(this.localPlayerId, localPlayer);

    if (this.channel) {
      this.channel.onmessage = (event: MessageEvent<MessagePayload>) => {
        this.handleMessage(event.data);
      };

      // Announce presence
      this.channel.postMessage({ type: 'ANNOUNCE', player: localPlayer });
    }
    this.notifyPlayerList();

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleUnload);
    }
  }

  private handleUnload = (): void => {
    this.leaveRoom();
  };

  private handleMessage(msg: MessagePayload): void {
    switch (msg.type) {
      case 'ANNOUNCE': {
        this.players.set(msg.player.id, msg.player);
        // Reply with full state sync so the new player gets current list
        if (this.channel) {
          this.channel.postMessage({
            type: 'STATE_SYNC',
            players: Array.from(this.players.values()),
          });
        }
        this.notifyPlayerList();
        break;
      }
      case 'STATE_SYNC': {
        for (const p of msg.players) {
          if (!this.players.has(p.id)) {
            this.players.set(p.id, p);
          }
        }
        this.notifyPlayerList();
        break;
      }
      case 'READY_TOGGLE': {
        const player = this.players.get(msg.playerId);
        if (player) {
          player.isReady = msg.isReady;
          this.notifyPlayerList();
        }
        break;
      }
      case 'MATCH_START': {
        this.matchStartListeners.forEach((cb) => cb());
        break;
      }
      case 'POSITION': {
        if (msg.playerId !== this.localPlayerId) {
          this.positionListeners.forEach((cb) => cb(msg.playerId, msg.x, msg.y));
        }
        break;
      }
      case 'FINISH': {
        const player = this.players.get(msg.playerId);
        if (player) {
          player.finished = true;
          player.finishTime = msg.finishTime;
        }
        this.finishListeners.forEach((cb) => cb(msg.playerId, msg.finishTime));
        this.notifyPlayerList();
        break;
      }
      case 'LEAVE': {
        this.players.delete(msg.playerId);
        this.notifyPlayerList();
        break;
      }
    }
  }

  public leaveRoom(): void {
    if (this.channel && this.localPlayerId) {
      this.channel.postMessage({ type: 'LEAVE', playerId: this.localPlayerId });
    }
    this.destroy();
  }

  public setReady(isReady: boolean): void {
    const local = this.players.get(this.localPlayerId);
    if (local) {
      local.isReady = isReady;
      this.channel?.postMessage({
        type: 'READY_TOGGLE',
        playerId: this.localPlayerId,
        isReady,
      });
      this.notifyPlayerList();
    }
  }

  public startMatch(): void {
    this.channel?.postMessage({ type: 'MATCH_START' });
    this.matchStartListeners.forEach((cb) => cb());
  }

  public broadcastPosition(x: number, y: number): void {
    if (!this.channel) return;
    if (this.throttleTimer) return;

    if (typeof window !== 'undefined') {
      this.throttleTimer = window.setTimeout(() => {
        this.throttleTimer = null;
      }, 60); // 16 Hz throttled
    }

    this.channel.postMessage({
      type: 'POSITION',
      playerId: this.localPlayerId,
      x,
      y,
    });
  }

  public broadcastFinish(timeElapsed: number): void {
    const local = this.players.get(this.localPlayerId);
    if (local) {
      local.finished = true;
      local.finishTime = timeElapsed;
    }
    this.channel?.postMessage({
      type: 'FINISH',
      playerId: this.localPlayerId,
      finishTime: timeElapsed,
    });
    this.notifyPlayerList();
  }

  public onPlayerListUpdate(callback: PlayerListListener): void {
    this.playerListListeners.add(callback);
    callback(Array.from(this.players.values()));
  }

  public onMatchStart(callback: MatchStartListener): void {
    this.matchStartListeners.add(callback);
  }

  public onPlayerPositionUpdate(callback: PositionListener): void {
    this.positionListeners.add(callback);
  }

  public onPlayerFinish(callback: FinishListener): void {
    this.finishListeners.add(callback);
  }

  private notifyPlayerList(): void {
    const list = Array.from(this.players.values());
    this.playerListListeners.forEach((cb) => cb(list));
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleUnload);
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.players.clear();
    this.playerListListeners.clear();
    this.matchStartListeners.clear();
    this.positionListeners.clear();
    this.finishListeners.clear();
  }
}
