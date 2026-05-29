import type { CrudRepo } from './types';

const SCHEMA_VERSION = 1;

interface StoredPayload<T> {
  schemaVersion: number;
  items: T[];
}

function migrate<T>(stored: StoredPayload<T>): StoredPayload<T> {
  // Phase 1: no cross-version migrations yet. Extension point.
  if (stored.schemaVersion < SCHEMA_VERSION) {
    // future migrations
  }
  return stored;
}

export class LocalStorageRepo<T extends { id: string }, Q = void>
  implements CrudRepo<T, Q>
{
  protected cache: T[] = [];
  private listeners = new Set<() => void>();

  constructor(
    protected readonly key: string,
    protected readonly filterFn?: (item: T, q: Q) => boolean,
  ) {
    this.loadFromLS();
  }

  protected loadFromLS(): void {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) {
        this.cache = [];
        return;
      }
      const parsed = JSON.parse(raw) as StoredPayload<T>;
      const next = migrate(parsed);
      this.cache = Array.isArray(next.items) ? next.items : [];
    } catch {
      this.cache = [];
    }
  }

  protected persist(): void {
    const payload: StoredPayload<T> = {
      schemaVersion: SCHEMA_VERSION,
      items: this.cache,
    };
    localStorage.setItem(this.key, JSON.stringify(payload));
  }

  protected notifyAll(): void {
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  listSync = (query?: Q): T[] => {
    if (query === undefined || this.filterFn === undefined) return this.cache;
    return this.cache.filter((item) => this.filterFn!(item, query));
  };

  async list(query?: Q): Promise<T[]> {
    return this.listSync(query);
  }

  async get(id: string): Promise<T | null> {
    return this.cache.find((x) => x.id === id) ?? null;
  }

  async save(item: T): Promise<void> {
    const idx = this.cache.findIndex((x) => x.id === item.id);
    this.cache =
      idx >= 0
        ? this.cache.map((x, i) => (i === idx ? item : x))
        : [...this.cache, item];
    this.persist();
    this.notifyAll();
  }

  async delete(id: string): Promise<void> {
    const next = this.cache.filter((x) => x.id !== id);
    if (next.length === this.cache.length) return;
    this.cache = next;
    this.persist();
    this.notifyAll();
  }

  protected replaceAll(items: T[]): void {
    this.cache = items;
    this.persist();
    this.notifyAll();
  }
}
