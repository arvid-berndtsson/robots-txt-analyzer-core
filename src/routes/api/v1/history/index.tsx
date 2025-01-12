import { type RequestHandler } from "@builder.io/qwik-city";
import { exampleUrls } from "~/data/example-urls";
import type { D1Database } from "../../../../types/cloudflare";
import { createLocalDB } from "../../../../utils/local-db";

interface HistoryEntry {
  domain: string;
  url: string;
  timestamp: string;
  is_real: boolean;
}

// Generate a fake entry
function generateFakeEntry(timestamp: Date): HistoryEntry {
  const url = exampleUrls[Math.floor(Math.random() * exampleUrls.length)];
  // Ensure URL has a protocol
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  return {
    url: fullUrl,
    domain: new URL(fullUrl).hostname,
    timestamp: timestamp.toISOString(),
    is_real: false,
  };
}

export const onGet: RequestHandler = async ({ json, env, request }) => {
  console.log("=== HISTORY ENDPOINT CALLED ===");
  console.log("Request URL:", request.url);
  console.log("Request method:", request.method);

  const apiKey = env.get("API_KEY");
  console.log("History: DB from env:", typeof env.get("DB"));
  const db = (
    typeof env.get("DB") === "object" ? env.get("DB") : createLocalDB()
  ) as D1Database;
  console.log("History: Using local DB:", typeof env.get("DB") !== "object");

  if (request.headers.get("X-API-Key") !== apiKey) {
    throw json(401, { error: "Unauthorized" });
  }

  if (!db) {
    throw json(500, { error: "Database not available" });
  }

  try {
    // Get recent entries first with a limit
    console.log("History: Fetching entries...");
    const stmt = db.prepare(`
      SELECT domain, url, timestamp, is_real
      FROM analyses 
      WHERE timestamp > datetime('now', '-2 hours')
      ORDER BY timestamp DESC
      LIMIT 25
    `);
    console.log("History: Prepared statement:", stmt);
    const { results: recentEntries } = await stmt.all<HistoryEntry>();
    console.log("History: Found", recentEntries.length, "recent entries");

    // Check if we need to generate new entries
    let needNewEntries = recentEntries.length < 25;

    // If we have entries, check the age of the most recent one
    if (recentEntries.length > 0) {
      const mostRecent = new Date(recentEntries[0].timestamp);
      const ageInMinutes = (Date.now() - mostRecent.getTime()) / (1000 * 60);
      console.log(
        "History: Most recent entry is",
        Math.round(ageInMinutes),
        "minutes old",
      );

      // If the most recent entry is older than 30 minutes, generate new ones
      if (ageInMinutes > 30) {
        needNewEntries = true;
        console.log(
          "History: Most recent entry is too old, generating new entries",
        );
      }
    }

    // If we don't need new entries, return what we have
    if (!needNewEntries) {
      json(200, recentEntries);
      return;
    }

    // Delete any existing fake entries older than 24 hours
    await db
      .prepare(
        `
      DELETE FROM analyses 
      WHERE is_real = false 
      AND timestamp < datetime('now', '-24 hours')
    `,
      )
      .run();

    // Generate fake entries if needed to show activity in last 2 hours
    const neededEntries = 25 - recentEntries.length;
    const now = Date.now();
    console.log("History: Generating", neededEntries, "fake entries");

    // Create user session patterns (reduced and simplified)
    const sessions = [
      { size: 3, timeSpan: 120000 }, // Someone comparing 3 sites in 2 minutes
      { size: 2, timeSpan: 60000 }, // Quick check of 2 sites in 1 minute
      { size: 4, timeSpan: 180000 }, // Thorough comparison of 4 sites in 3 minutes
      { size: 2, timeSpan: 45000 }, // Very quick comparison of 2 sites
      { size: 3, timeSpan: 120000 }, // Another 3-site comparison
      { size: 2, timeSpan: 90000 }, // Medium-paced comparison
      { size: 3, timeSpan: 150000 }, // Detailed look at 3 sites
    ];

    const fakeEntries: HistoryEntry[] = [];
    let entriesNeeded = neededEntries;
    let currentTime = now;

    // Distribute sessions across the 2-hour window with more natural gaps
    while (entriesNeeded > 0 && sessions.length > 0) {
      // Pick a random session pattern
      const sessionIndex = Math.floor(Math.random() * sessions.length);
      const session = sessions[sessionIndex];
      sessions.splice(sessionIndex, 1); // Remove used session

      // Skip if this session would create too many entries
      if (session.size > entriesNeeded) {
        continue;
      }

      // Add more realistic gap between sessions (5-20 minutes)
      currentTime -= Math.floor(Math.random() * 900000) + 300000;

      // Generate entries for this session
      for (let i = 0; i < session.size; i++) {
        // Calculate time within session (slightly random intervals)
        const progress = i / (session.size - 1);
        const baseOffset = session.timeSpan * progress;
        const randomVariation = Math.floor(Math.random() * 15000); // Up to 15 seconds variation
        const timestamp = new Date(currentTime - baseOffset - randomVariation);

        fakeEntries.push(generateFakeEntry(timestamp));
      }

      entriesNeeded -= session.size;
    }

    // If we still need entries, add some individual scans
    while (entriesNeeded > 0) {
      // Random time in the remaining window with better distribution
      const randomTime = Math.floor(Math.random() * 7200000);
      const timestamp = new Date(now - randomTime);
      fakeEntries.push(generateFakeEntry(timestamp));
      entriesNeeded--;
    }

    // Sort fake entries by timestamp
    fakeEntries.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Insert fake entries one by one (more compatible with D1)
    for (const entry of fakeEntries) {
      await db
        .prepare(
          `
        INSERT INTO analyses (domain, url, timestamp, is_real) 
        VALUES (?, ?, ?, ?)
      `,
        )
        .bind(entry.domain, entry.url, entry.timestamp, 0)
        .run();
    }

    // Get final entries with limit
    const { results: allEntries } = await db
      .prepare(
        `
      SELECT domain, url, timestamp, is_real
      FROM analyses 
      ORDER BY timestamp DESC
      LIMIT 25
    `,
      )
      .all<HistoryEntry>();

    console.log("History: Returning", allEntries.length, "total entries");

    json(200, allEntries);
  } catch (error) {
    console.error("Error:", error);
    throw json(500, { error: "Failed to fetch history" });
  }
};
