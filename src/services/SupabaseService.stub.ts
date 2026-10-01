import {
  IMultiplayerService,
  PlayerState,
  PlayerListListener,
  MatchStartListener,
  PositionListener,
  FinishListener,
} from './IMultiplayerService';

/**
 * STUB IMPLEMENTASI: Untuk tim Backend Supabase.
 *
 * Silakan implementasikan method di bawah menggunakan @supabase/supabase-js realtime:
 *
 * Contoh inisialisasi:
 * const channel = supabase.channel(`room:${roomId}`, {
 *   config: { presence: { key: playerId }, broadcast: { ack: false } }
 * });
 */
export class SupabaseService implements IMultiplayerService {
  public async createRoom(hostName: string): Promise<string> {
    // 1. Generate room_code (misal: MBG-xxx)
    // 2. Insert record ke tabel 'rooms' (id, room_code, status = 'waiting', host_id, created_at)
    // 3. Subscribe ke Supabase Realtime channel
    return 'MBG-SUPABASE';
  }

  public async joinRoom(roomId: string, playerName: string): Promise<boolean> {
    // 1. Validasi room di database
    // 2. Insert ke tabel 'players' (room_id, player_name, is_ready, etc.)
    // 3. Subscribe ke Realtime channel & track presence
    return true;
  }

  public leaveRoom(): void {
    // Untrack presence & unsubscribe channel
  }

  public setReady(isReady: boolean): void {
    // channel.track({ isReady }) atau broadcast 'ready_changed'
  }

  public startMatch(): void {
    // channel.send({ type: 'broadcast', event: 'start_match', payload: {} })
  }

  public broadcastPosition(x: number, y: number): void {
    // channel.send({ type: 'broadcast', event: 'pos', payload: { x, y } }) (throttled)
  }

  public broadcastFinish(timeElapsed: number): void {
    // 1. channel.send({ type: 'broadcast', event: 'finish', payload: { timeElapsed } })
    // 2. Update record players/results di database
  }

  public onPlayerListUpdate(callback: PlayerListListener): void {
    // channel.on('presence', { event: 'sync' }, () => { ... callback(...) })
  }

  public onMatchStart(callback: MatchStartListener): void {
    // channel.on('broadcast', { event: 'start_match' }, () => callback())
  }

  public onPlayerPositionUpdate(callback: PositionListener): void {
    // channel.on('broadcast', { event: 'pos' }, ({ payload }) => callback(payload.id, payload.x, payload.y))
  }

  public onPlayerFinish(callback: FinishListener): void {
    // channel.on('broadcast', { event: 'finish' }, ({ payload }) => callback(payload.id, payload.timeElapsed))
  }

  public destroy(): void {
    // supabase.removeChannel(channel)
  }
}
