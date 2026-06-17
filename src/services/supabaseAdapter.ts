import { supabase } from '../lib/supabase';
import type { ApiService } from './api';

export class SupabaseAdapter<T extends { id: string }> implements ApiService<T> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const { data, error } = await supabase.from(this.tableName).select('*');
    if (error) {
      console.error('Supabase getAll error:', error);
      return [];
    }
    return (data as T[]) ?? [];
  }

  async getById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Supabase getById error:', error);
      return null;
    }
    return (data as T) ?? null;
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data as unknown as Record<string, unknown>)
      .select()
      .single();
    if (error) {
      console.error('Supabase create error:', error);
      throw error;
    }
    return result as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data as unknown as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    return result as T;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);
    if (error) {
      console.error('Supabase remove error:', error);
      throw error;
    }
  }
}
