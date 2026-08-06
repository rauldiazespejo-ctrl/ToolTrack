import { supabase } from '../lib/supabase';
import type { ApiService } from './api';

/**
 * Server-managed columns that should be stripped from create/update payloads
 * so PostgreSQL defaults / triggers can manage them.
 */
const SERVER_MANAGED_COLUMNS = ['id', 'created_at', 'updated_at'] as const;

function stripServerManaged<T extends object>(data: T): Record<string, unknown> {
  const clone = { ...data } as unknown as Record<string, unknown>;
  for (const col of SERVER_MANAGED_COLUMNS) {
    delete clone[col];
  }
  return clone;
}

export class SupabaseAdapter<T extends { id: string }> implements ApiService<T> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const result = await supabase.from(this.tableName).select('*');
    if (result.error) {
      console.error('Supabase getAll error:', result.error);
      return [];
    }
    return (result.data as T[]) ?? [];
  }

  async getById(id: string): Promise<T | null> {
    const result = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (result.error) {
      console.error('Supabase getById error:', result.error);
      return null;
    }
    return (result.data as T) ?? null;
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const payload = stripServerManaged(data);
    const result = await supabase
      .from(this.tableName)
      .insert(payload)
      .select()
      .single();
    if (result.error) {
      console.error('Supabase create error:', result.error);
      throw result.error;
    }
    if (!result.data) {
      throw new Error('Supabase insert returned no data');
    }
    return result.data as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const payload = stripServerManaged(data);
    const result = await supabase
      .from(this.tableName)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (result.error) {
      console.error('Supabase update error:', result.error);
      throw result.error;
    }
    if (!result.data) {
      throw new Error('Supabase update returned no data');
    }
    return result.data as T;
  }

  async remove(id: string): Promise<void> {
    const result = await supabase.from(this.tableName).delete().eq('id', id);
    if (result.error) {
      console.error('Supabase remove error:', result.error);
      throw result.error;
    }
  }
}
