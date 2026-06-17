import type { ApiService } from './api';
import { LocalStorageAdapter } from './localStorageAdapter';
import { SupabaseAdapter } from './supabaseAdapter';

export function createAdapter<T extends { id: string }>(
  key: string,
  tableName: string,
  seed: T[]
): ApiService<T> {
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  if (useSupabase) {
    return new SupabaseAdapter<T>(tableName);
  }
  return new LocalStorageAdapter<T>(key, seed);
}

export type { ApiService } from './api';
export { LocalStorageAdapter } from './localStorageAdapter';
export { SupabaseAdapter } from './supabaseAdapter';
