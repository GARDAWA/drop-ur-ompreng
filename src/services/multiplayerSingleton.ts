import { SupabaseRealtimeService } from './SupabaseRealtimeService';
import { BroadcastChannelService } from './BroadcastChannelService';
import { IMultiplayerService } from './IMultiplayerService';

let serviceInstance: IMultiplayerService | null = null;

export function getMultiplayerService(): IMultiplayerService {
  if (!serviceInstance) {
    const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const hasSupabaseKey = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (hasSupabaseUrl && hasSupabaseKey) {
      serviceInstance = new SupabaseRealtimeService();
    } else {
      serviceInstance = new BroadcastChannelService();
    }
  }
  return serviceInstance;
}
