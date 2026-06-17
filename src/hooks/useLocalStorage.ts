import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, seed: T[]) {
  const [items, setItemsState] = useState<T[]>(() => {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  });

  const setItems = useCallback(
    (newItems: T[]) => {
      localStorage.setItem(key, JSON.stringify(newItems));
      setItemsState(newItems);
    },
    [key]
  );

  const load = useCallback(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored) as T[];
      setItemsState(parsed);
      return parsed;
    }
    return seed;
  }, [key, seed]);

  return [items, setItems, load] as const;
}
