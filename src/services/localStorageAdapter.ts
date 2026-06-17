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
    if (stored) {
      const parsed = JSON.parse(stored) as T[];
      return parsed;
    }
    localStorage.setItem(this.key, JSON.stringify(this.seed));
    return this.seed;
  }

  private save(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  getAll(): Promise<T[]> {
    return Promise.resolve(this.load());
  }

  getById(id: string): Promise<T | null> {
    return Promise.resolve(this.load().find((item) => item.id === id) ?? null);
  }

  create(data: Omit<T, 'id'>): Promise<T> {
    const items = this.load();
    const newItem = { ...data, id: crypto.randomUUID() } as T;
    const updated = [...items, newItem];
    this.save(updated);
    return Promise.resolve(newItem);
  }

  update(id: string, data: Partial<T>): Promise<T> {
    const items = this.load();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }
    const updated = { ...items[index], ...data };
    const newItems = [...items.slice(0, index), updated, ...items.slice(index + 1)];
    this.save(newItems);
    return Promise.resolve(updated);
  }

  remove(id: string): Promise<void> {
    const items = this.load();
    const updated = items.filter((item) => item.id !== id);
    this.save(updated);
    return Promise.resolve();
  }
}
