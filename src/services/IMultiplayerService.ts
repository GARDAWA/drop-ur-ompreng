export interface PlayerState {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  x: number;
  y: number;
  finished: boolean;
  finishTime?: number;
}

export type PlayerListListener = (players: PlayerState[]) => void;
export type MatchStartListener = () => void;
export type PositionListener = (playerId: string, x: number, y: number, name?: string) => void;
export type FinishListener = (playerId: string, finishTime: number) => void;
export type ReplayListener = () => void;

export interface StartMatchResult {
  success: boolean;
  isHost: boolean;
  message?: string;
}

export interface IMultiplayerService {
  createRoom(hostName: string): Promise<string>;
  joinRoom(roomId: string, playerName: string): Promise<boolean>;
  leaveRoom(): void;
  setReady(isReady: boolean): void;
  startMatch(): void;
  requestStartMatch(): Promise<StartMatchResult>;
  broadcastPosition(x: number, y: number): void;
  broadcastFinish(timeElapsed: number): void;
  broadcastReplay(): void;
  resetMatch(): void;
  getCurrentRoomId(): string | null;
  getLocalPlayerId(): string;

  onPlayerListUpdate(callback: PlayerListListener): () => void;
  onMatchStart(callback: MatchStartListener): () => void;
  onPlayerPositionUpdate(callback: PositionListener): () => void;
  onPlayerFinish(callback: FinishListener): () => void;
  onReplay(callback: ReplayListener): () => void;
  destroy(): void;
}
