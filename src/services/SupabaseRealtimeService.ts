import {
  IMultiplayerService,
  PlayerState,
  PlayerListListener,
  MatchStartListener,
  PositionListener,
  FinishListener,
  ReplayListener,
} from './IMultiplayerService';
import { getSupabaseClient } from '@/lib/supabase';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

type PresencePayload = {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  x: number;
  y: number;
  finished: boolean;
  finishTime?: number;
};

export class SupabaseRealtimeService implements IMultiplayerService {
  private currentRoomId: string | null = null;
  private localPlayerId: string = '';
  private localPlayerName: string = '';
  private isHost: boolean = false;
  private players: Map<string, PlayerState> = new Map();

  private supabase: SupabaseClient | null = null;
  private channel: RealtimeChannel | null = null;
  private fallbackChannel: BroadcastChannel | null = null;

  private playerListListeners: Set<PlayerListListener> = new Set();
  private matchStartListeners: Set<MatchStartListener> = new Set();
  private positionListeners: Set<PositionListener> = new Set();
  private finishListeners: Set<FinishListener> = new Set();
  private replayListeners: Set<ReplayListener> = new Set();

  private throttleTimer: number | null = null;

  constructor() {
    this.localPlayerId = 'p_' + Math.random().toString(36).substring(2, 9);
    try {
      this.supabase = getSupabaseClient();
    } catch {
      // Offline or missing credentials - fallback gracefully
      this.supabase = null;
    }
  }

  public async createRoom(hostName: string): Promise<string> {
    const code = `MBG-${Math.floor(100 + Math.random() * 900)}`;
    this.isHost = true;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`is_host_${code}`, 'true');
    }

    await this.connect(code, hostName, true);

    // Save room in Supabase database asynchronously
    if (this.supabase) {
      Promise.resolve(
        this.supabase.from('rooms').insert({
          code,
          host_name: hostName,
          status: 'waiting',
          max_players: 4,
        })
      ).catch(() => {});
    }

    return code;
  }

  public async joinRoom(roomId: string, playerName: string): Promise<boolean> {
    const normalizedCode = roomId.trim().toUpperCase();
    const storedHost =
      typeof window !== 'undefined' &&
      sessionStorage.getItem(`is_host_${normalizedCode}`) === 'true';

    this.isHost = storedHost;
    await this.connect(normalizedCode, playerName, this.isHost);
    return true;
  }

  private async connect(
    roomId: string,
    playerName: string,
    isHost: boolean
  ): Promise<void> {
    this.destroy();

    this.currentRoomId = roomId;
    this.localPlayerName = playerName;
    this.isHost = isHost;

    const localPlayer: PlayerState = {
      id: this.localPlayerId,
      name: playerName,
      isHost: this.isHost,
      isReady: false,
      x: 100,
      y: 400,
      finished: false,
    };

    this.players.set(this.localPlayerId, localPlayer);
    this.notifyPlayerList();

    // Setup local BroadcastChannel for same-browser instant tab sync & offline resilience
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.fallbackChannel = new BroadcastChannel(`drop_embege_room_${roomId}`);
        this.fallbackChannel.onmessage = (event: MessageEvent) => {
          this.handleFallbackMessage(event.data);
        };
        this.fallbackChannel.postMessage({
          type: 'ANNOUNCE',
          player: localPlayer,
        });
      } catch {
        this.fallbackChannel = null;
      }
    }

    // Connect to Supabase Realtime Channel
    if (this.supabase) {
      try {
        const channelName = `online_room_${roomId}`;
        this.channel = this.supabase.channel(channelName, {
          config: {
            presence: { key: this.localPlayerId },
            broadcast: { ack: false },
          },
        });

        // 1. Presence Sync (tracks who is in the room)
        this.channel
          .on('presence', { event: 'sync' }, () => {
            if (!this.channel) return;
            const presenceState = this.channel.presenceState<PresencePayload>();
            this.handlePresenceSync(presenceState);
          })
          .on('presence', { event: 'leave' }, ({ key }) => {
            if (key !== this.localPlayerId) {
              this.players.delete(key);
              this.ensureHostExists();
              this.notifyPlayerList();
            }
          });

        // 2. Broadcasts (low latency position, start match, finish, replay)
        this.channel
          .on('broadcast', { event: 'pos' }, ({ payload }) => {
            if (payload && payload.id !== this.localPlayerId) {
              const remote = this.players.get(payload.id);
              if (remote) {
                remote.x = payload.x;
                remote.y = payload.y;
              }
              this.positionListeners.forEach((cb) =>
                cb(payload.id, payload.x, payload.y)
              );
            }
          })
          .on('broadcast', { event: 'start_match' }, () => {
            this.matchStartListeners.forEach((cb) => cb());
          })
          .on('broadcast', { event: 'finish' }, ({ payload }) => {
            if (payload && payload.id) {
              const p = this.players.get(payload.id);
              if (p) {
                p.finished = true;
                p.finishTime = payload.finishTime;
              }
              this.finishListeners.forEach((cb) =>
                cb(payload.id, payload.finishTime)
              );
              this.notifyPlayerList();
            }
          })
          .on('broadcast', { event: 'replay' }, () => {
            this.resetMatch();
            this.replayListeners.forEach((cb) => cb());
          });

        await this.channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && this.channel) {
            await this.channel.track({
              id: this.localPlayerId,
              name: this.localPlayerName,
              isHost: this.isHost,
              isReady: localPlayer.isReady,
              x: localPlayer.x,
              y: localPlayer.y,
              finished: false,
            });
          }
        });
      } catch {
        // Fallback to BroadcastChannel if realtime subscription fails
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleUnload);
    }
  }

  private handlePresenceSync(presenceState: Record<string, PresencePayload[]>): void {
    const presentIds = new Set<string>();

    for (const [key, presences] of Object.entries(presenceState)) {
      if (presences && presences.length > 0) {
        const data = presences[presences.length - 1];
        presentIds.add(data.id || key);

        if ((data.id || key) === this.localPlayerId) {
          // Local player state
          const local = this.players.get(this.localPlayerId);
          if (local) {
            local.isReady = data.isReady;
          }
        } else {
          // Remote player state
          const existing = this.players.get(data.id || key);
          if (existing) {
            existing.name = data.name;
            existing.isHost = data.isHost;
            existing.isReady = data.isReady;
            if (data.finished !== undefined) existing.finished = data.finished;
            if (data.finishTime !== undefined) existing.finishTime = data.finishTime;
          } else {
            this.players.set(data.id || key, {
              id: data.id || key,
              name: data.name,
              isHost: data.isHost,
              isReady: data.isReady,
              x: data.x ?? 100,
              y: data.y ?? 400,
              finished: data.finished ?? false,
              finishTime: data.finishTime,
            });
          }
        }
      }
    }

    // Clean up disconnected players
    for (const id of Array.from(this.players.keys())) {
      if (id !== this.localPlayerId && !presentIds.has(id)) {
        this.players.delete(id);
      }
    }

    this.ensureHostExists();
    this.notifyPlayerList();
  }

  private ensureHostExists(): void {
    const playerList = Array.from(this.players.values());
    if (playerList.length === 0) return;

    const hasHost = playerList.some((p) => p.isHost);
    if (!hasHost) {
      // Elect earliest player or local player
      playerList[0].isHost = true;
      if (playerList[0].id === this.localPlayerId) {
        this.isHost = true;
        if (this.currentRoomId && typeof window !== 'undefined') {
          sessionStorage.setItem(`is_host_${this.currentRoomId}`, 'true');
        }
      }
    }
  }

  private handleFallbackMessage(msg: any): void {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'ANNOUNCE': {
        if (msg.player && msg.player.id !== this.localPlayerId) {
          this.players.set(msg.player.id, msg.player);
          this.fallbackChannel?.postMessage({
            type: 'STATE_SYNC',
            players: Array.from(this.players.values()),
          });
          this.notifyPlayerList();
        }
        break;
      }
      case 'STATE_SYNC': {
        if (Array.isArray(msg.players)) {
          for (const p of msg.players) {
            if (!this.players.has(p.id)) {
              this.players.set(p.id, p);
            }
          }
          this.notifyPlayerList();
        }
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
          const remote = this.players.get(msg.playerId);
          if (remote) {
            remote.x = msg.x;
            remote.y = msg.y;
          }
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
      case 'REPLAY': {
        this.resetMatch();
        this.replayListeners.forEach((cb) => cb());
        break;
      }
      case 'LEAVE': {
        this.players.delete(msg.playerId);
        this.ensureHostExists();
        this.notifyPlayerList();
        break;
      }
    }
  }

  public leaveRoom(): void {
    if (this.channel) {
      try {
        this.channel.untrack().then(() => {});
        this.supabase?.removeChannel(this.channel);
      } catch {}
      this.channel = null;
    }

    if (this.fallbackChannel) {
      try {
        this.fallbackChannel.postMessage({
          type: 'LEAVE',
          playerId: this.localPlayerId,
        });
        this.fallbackChannel.close();
      } catch {}
      this.fallbackChannel = null;
    }

    if (this.currentRoomId && typeof window !== 'undefined') {
      sessionStorage.removeItem(`is_host_${this.currentRoomId}`);
    }

    this.currentRoomId = null;
    this.players.clear();
    this.notifyPlayerList();
  }

  public setReady(isReady: boolean): void {
    const local = this.players.get(this.localPlayerId);
    if (local) {
      local.isReady = isReady;

      // Update Supabase Presence
      if (this.channel) {
        this.channel.track({
          id: this.localPlayerId,
          name: this.localPlayerName,
          isHost: this.isHost,
          isReady,
          x: local.x,
          y: local.y,
          finished: local.finished,
          finishTime: local.finishTime,
        }).catch(() => {});
      }

      // Update Fallback Channel
      this.fallbackChannel?.postMessage({
        type: 'READY_TOGGLE',
        playerId: this.localPlayerId,
        isReady,
      });

      this.notifyPlayerList();
    }
  }

  public startMatch(): void {
    // Broadcast via Supabase Realtime
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'start_match',
        payload: {},
      }).catch(() => {});
    }

    // Broadcast via fallback
    this.fallbackChannel?.postMessage({ type: 'MATCH_START' });

    // Local notification
    this.matchStartListeners.forEach((cb) => cb());
  }

  public broadcastPosition(x: number, y: number): void {
    const local = this.players.get(this.localPlayerId);
    if (local) {
      local.x = x;
      local.y = y;
    }

    if (this.throttleTimer) return;
    if (typeof window !== 'undefined') {
      this.throttleTimer = window.setTimeout(() => {
        this.throttleTimer = null;
      }, 50); // 20 Hz
    }

    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'pos',
        payload: { id: this.localPlayerId, x, y },
      }).catch(() => {});
    }

    this.fallbackChannel?.postMessage({
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

    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'finish',
        payload: { id: this.localPlayerId, finishTime: timeElapsed },
      }).catch(() => {});
    }

    this.fallbackChannel?.postMessage({
      type: 'FINISH',
      playerId: this.localPlayerId,
      finishTime: timeElapsed,
    });

    this.finishListeners.forEach((cb) => cb(this.localPlayerId, timeElapsed));
    this.notifyPlayerList();

    // Persist race finish to Supabase leaderboard
    if (this.supabase && this.localPlayerName) {
      Promise.resolve(
        this.supabase.from('leaderboard').insert({
          player_name: this.localPlayerName,
          finish_time: timeElapsed,
          nitro_used: 1,
          stunts_performed: 1,
          pickups_collected: 5,
        })
      ).catch(() => {});
    }
  }

  public broadcastReplay(): void {
    this.resetMatch();

    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'replay',
        payload: {},
      }).catch(() => {});
    }

    this.fallbackChannel?.postMessage({ type: 'REPLAY' });
    this.replayListeners.forEach((cb) => cb());
  }

  public resetMatch(): void {
    for (const p of this.players.values()) {
      p.finished = false;
      p.finishTime = undefined;
      p.isReady = false;
      p.x = 100;
      p.y = 400;
    }
    this.notifyPlayerList();
  }

  public getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  public getLocalPlayerId(): string {
    return this.localPlayerId;
  }

  public onPlayerListUpdate(callback: PlayerListListener): () => void {
    this.playerListListeners.add(callback);
    callback(Array.from(this.players.values()));
    return () => {
      this.playerListListeners.delete(callback);
    };
  }

  public onMatchStart(callback: MatchStartListener): () => void {
    this.matchStartListeners.add(callback);
    return () => {
      this.matchStartListeners.delete(callback);
    };
  }

  public onPlayerPositionUpdate(callback: PositionListener): () => void {
    this.positionListeners.add(callback);
    return () => {
      this.positionListeners.delete(callback);
    };
  }

  public onPlayerFinish(callback: FinishListener): () => void {
    this.finishListeners.add(callback);
    return () => {
      this.finishListeners.delete(callback);
    };
  }

  public onReplay(callback: ReplayListener): () => void {
    this.replayListeners.add(callback);
    return () => {
      this.replayListeners.delete(callback);
    };
  }

  private notifyPlayerList(): void {
    const list = Array.from(this.players.values());
    this.playerListListeners.forEach((cb) => cb(list));
  }

  private handleUnload = (): void => {
    this.leaveRoom();
  };

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleUnload);
    }
    if (this.channel) {
      try {
        this.supabase?.removeChannel(this.channel);
      } catch {}
      this.channel = null;
    }
    if (this.fallbackChannel) {
      try {
        this.fallbackChannel.close();
      } catch {}
      this.fallbackChannel = null;
    }
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
  }
}
