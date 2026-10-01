import { BroadcastChannelService } from './BroadcastChannelService';
import { IMultiplayerService } from './IMultiplayerService';

let serviceInstance: IMultiplayerService | null = null;

export function getMultiplayerService(): IMultiplayerService {
  if (!serviceInstance) {
    serviceInstance = new BroadcastChannelService();
  }
  return serviceInstance;
}
