import { type RequestHandler } from "@builder.io/qwik-city";
import { type KVNamespace, createLocalKV } from "../../../../utils/local-kv";

// TODO: Make this a POST request, and add security with API key
export const onGet: RequestHandler = async ({ json, env, request }) => {
  const apiKey = env.get("API_KEY");
  const historyKV = (typeof env.get("HISTORY_KV") === 'object' ? 
    env.get("HISTORY_KV") : createLocalKV()) as KVNamespace;

  // Only allow requests with API key
  if (request.headers.get("X-API-Key") !== apiKey) {
    throw json(401, { error: "Unauthorized" });
  }

  try {
    const now = Date.now();
    const stats = {
      cache: { total: 0, deleted: 0 },
      tempHistory: { total: 0, deleted: 0 }
    };

    // TODO: Verify that it should be 24 hours, I think it should be 6 hours
    // Clean up old cache entries (older than 24 hours)
    const cacheList = await historyKV.list({ prefix: 'cache:' });
    stats.cache.total = cacheList.keys.length;
    
    await Promise.all(
      cacheList.keys.map(async (key) => {
        const value = await historyKV.get(key.name);
        if (value) {
          const parsed = JSON.parse(value);
          const age = now - new Date(parsed.timestamp).getTime();
          
          if (age > 24 * 60 * 60 * 1000) {
            await historyKV.delete(key.name);
            stats.cache.deleted++;
          }
        }
      })
    );

    // TODO: Verify that it should be 1 hour, I think it should be 2 hours, based on how temp-history is generated
    // Clean up temporary history entries (older than 1 hour)
    const tempList = await historyKV.list({ prefix: 'temp-history:' });
    stats.tempHistory.total = tempList.keys.length;

    await Promise.all(
      tempList.keys.map(async (key) => {
        const value = await historyKV.get(key.name);
        if (value) {
          const parsed = JSON.parse(value);
          const age = now - new Date(parsed.timestamp).getTime();
          
          if (age > 60 * 60 * 1000) {
            await historyKV.delete(key.name);
            stats.tempHistory.deleted++;
          }
        }
      })
    );

    json(200, {
      success: true,
      cleaned: stats
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    throw json(500, { error: 'Failed to clean up KV store' });
  }
};