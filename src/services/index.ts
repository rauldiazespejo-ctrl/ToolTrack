import type { ApiService } from './api';
import { LocalStorageAdapter } from './localStorageAdapter';
import { SupabaseAdapter } from './supabaseAdapter';
import { ApiAdapter } from './apiAdapter';

/**
 * Build a data adapter. Precedence:
 *   VITE_USE_API=true       -> REST API (Hono + Neon + Clerk)
 *   VITE_USE_SUPABASE=true  -> Supabase
 *   default                 -> LocalStorage (offline dev mode)
 */
export function createAdapter<T extends { id: string }>(
  key: string,
  tableName: string,
  seed: T[]
): ApiService<T> {
  if (import.meta.env.VITE_USE_API === 'true') {
    const resource =
      tableName === 'activity_logs' ? 'activity-logs' :
      tableName === 'maintenance_orders' ? 'maintenance' :
      tableName;
    return new ApiAdapter<T>(resource);
  }
  if (import.meta.env.VITE_USE_SUPABASE === 'true') {
    return new SupabaseAdapter<T>(tableName);
  }
  return new LocalStorageAdapter<T>(key, seed);
}

export type { ApiService } from './api';
export { LocalStorageAdapter } from './localStorageAdapter';
export { SupabaseAdapter } from './supabaseAdapter';
export { ApiAdapter, setAuthTokenProvider } from './apiAdapter';
