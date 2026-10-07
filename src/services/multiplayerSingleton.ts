import { SupabaseRealtimeService } from './SupabaseRealtimeService';
import { BroadcastChannelService } from './BroadcastChannelService';
import { IMultiplayerService } from './IMultiplayerService';
import { getResolvedSupabaseConfig } from '@/lib/supabase/config';

let serviceInstance: IMultiplayerService | null = null;

export function getMultiplayerService(): IMultiplayerService {
  if (!serviceInstance) {
    const { url, key } = getResolvedSupabaseConfig();

    if (url && key) {
      serviceInstance = new SupabaseRealtimeService();
    } else {
      serviceInstance = new BroadcastChannelService();
    }
  }
  return serviceInstance;
}
