import type { ApiService } from './api';

export class LocalStorageAdapter<T extends { id: string }> implements ApiService<T> {
  private key: string;
  private seed: T[];

  constructor(key: string, seed: T[]) {
    this.key = key;
    this.seed = seed;
  }

  private load(): T[] {
    const stored = localStorage.getItem(this.key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(this.key, JSON.stringify(this.seed));
    return this.seed;
  }

  private save(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  async getAll(): Promise<T[]> {
    return this.load();
  }

  async getById(id: string): Promise<T | null> {
    return this.load().find((item) => item.id === id) ?? null;
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const items = this.load();
    const newItem = { ...(data as unknown as Record<string, unknown>), id: crypto.randomUUID() } as T;
    const updated = [...items, newItem];
    this.save(updated);
    return newItem;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const items = this.load();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }
    const updated = { ...items[index], ...data } as T;
    const newItems = [...items.slice(0, index), updated, ...items.slice(index + 1)];
    this.save(newItems);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const items = this.load();
    const updated = items.filter((item) => item.id !== id);
    this.save(updated);
  }
}
