export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string | null }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor: string | null;
  }>;
}

// Local development memory cache
const localCache = new Map<string, { value: string; timestamp: number }>();

// Mock KV for local development
export const createLocalKV = (): KVNamespace => ({
  async get(key: string) {
    const cached = localCache.get(key);
    if (!cached) return null;
    // Clean up old entries
    if (Date.now() - cached.timestamp > 60000) {
      localCache.delete(key);
      return null;
    }
    return cached.value;
  },
  async put(key: string, value: string) {
    localCache.set(key, { value, timestamp: Date.now() });
  },
  async delete(key: string) {
    localCache.delete(key);
  },
  async list(options?: { prefix?: string }) {
    const keys = Array.from(localCache.keys())
      .filter(key => !options?.prefix || key.startsWith(options.prefix))
      .map(name => ({ name }));
    return {
      keys,
      list_complete: true,
      cursor: null
    };
  }
}); 