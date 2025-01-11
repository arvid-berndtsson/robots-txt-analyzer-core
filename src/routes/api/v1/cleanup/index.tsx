import { type RequestHandler } from "@builder.io/qwik-city";
import type { D1Database } from "../../../../types/cloudflare";
import { createLocalDB } from "../../../../utils/local-db";

export const onGet: RequestHandler = async ({ json, env, request }) => {
  const apiKey = env.get("API_KEY");
  const db = (typeof env.get("DB") === 'object' ? 
    env.get("DB") : createLocalDB()) as D1Database;

  // Only allow requests with API key
  if (request.headers.get("X-API-Key") !== apiKey) {
    throw json(401, { error: "Unauthorized" });
  }

  if (!db) {
    throw json(500, { error: 'Database not available' });
  }

  try {
    // Clean up old cache entries (older than 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { changes: cacheDeleted } = await db.prepare(`
      DELETE FROM cache 
      WHERE timestamp < ?
    `).bind(oneDayAgo).run();

    // Clean up fake history entries (older than 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { changes: fakeDeleted } = await db.prepare(`
      DELETE FROM analyses 
      WHERE is_real = 0 
      AND timestamp < ?
    `).bind(twoHoursAgo).run();

    json(200, {
      success: true,
      cleaned: {
        cache: cacheDeleted,
        fakeHistory: fakeDeleted
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    throw json(500, { error: 'Failed to clean up database' });
  }
}; 
