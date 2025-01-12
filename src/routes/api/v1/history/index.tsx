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
function generateFakeEntry(timestamp: string): HistoryEntry {
  const url = exampleUrls[Math.floor(Math.random() * exampleUrls.length)];
  // Ensure URL has a protocol
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  return {
    url: fullUrl,
    domain: new URL(fullUrl).hostname,
    timestamp,
    is_real: false,
  };
}

export const onGet: RequestHandler = async ({ json, env, request }) => {
  console.log("=== HISTORY ENDPOINT CALLED ===");
  console.log("Request URL:", request.url);
  console.log("Request method:", request.method);

  try {
    const apiKey = env.get("API_KEY");
    console.log("History: DB from env:", typeof env.get("DB"));
    const db = (
      typeof env.get("DB") === "object" ? env.get("DB") : createLocalDB()
    ) as D1Database;
    console.log("History: Using local DB:", typeof env.get("DB") !== "object");

    if (request.headers.get("X-API-Key") !== apiKey) {
      console.error("History: Unauthorized access attempt");
      throw json(401, { error: "Unauthorized" });
    }

    if (!db) {
      console.error("History: Database not available");
      throw json(500, { error: "Database not available" });
    }

    try {
      // Get recent entries first with a limit
      console.log("History: Fetching entries...");
      const twoHoursAgo = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString();
      const stmt = db.prepare(`
        SELECT domain, url, timestamp, is_real
        FROM analyses 
        WHERE timestamp > ?
        ORDER BY timestamp DESC
        LIMIT 25
      `);
      console.log("History: Prepared statement:", stmt);

      let recentEntries: HistoryEntry[];
      try {
        const result = await stmt.bind(twoHoursAgo).all<HistoryEntry>();
        recentEntries = result.results;
        console.log("History: Found", recentEntries.length, "recent entries");
      } catch (error) {
        console.error("History: Error fetching recent entries:", error);
        throw new Error("Failed to fetch recent entries");
      }

      // Check if we need to generate new entries
      let needNewEntries = recentEntries.length < 25;

      // If we have entries, check the age of the most recent one
      if (recentEntries.length > 0) {
        try {
          const mostRecent = new Date(recentEntries[0].timestamp);
          const ageInMinutes =
            (Date.now() - mostRecent.getTime()) / (1000 * 60);
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
        } catch (error) {
          console.error("History: Error checking entry age:", error);
          // Continue with generating new entries if we can't parse the timestamp
          needNewEntries = true;
        }
      }

      // If we don't need new entries, return what we have
      if (!needNewEntries) {
        json(200, recentEntries);
        return;
      }

      // Delete any existing fake entries older than 24 hours
      try {
        const oneDayAgo = new Date(
          Date.now() - 24 * 60 * 60 * 1000,
        ).toISOString();
        await db
          .prepare(
            `
          DELETE FROM analyses 
          WHERE is_real = false 
          AND timestamp < ?
        `,
          )
          .bind(oneDayAgo)
          .run();
        console.log("History: Deleted old fake entries");
      } catch (error) {
        console.error("History: Error deleting old fake entries:", error);
        // Continue even if cleanup fails
      }

      // Generate fake entries if needed to show activity in last 2 hours
      const neededEntries = 25 - recentEntries.length;
      console.log("History: Generating", neededEntries, "fake entries");

      const fakeEntries: HistoryEntry[] = [];
      let entriesNeeded = neededEntries;

      // Create user session patterns (reduced and simplified)
      const sessions = [
        { size: 3, timeSpan: 2 }, // Someone comparing 3 sites in 2 minutes
        { size: 2, timeSpan: 1 }, // Quick check of 2 sites in 1 minute
        { size: 4, timeSpan: 3 }, // Thorough comparison of 4 sites in 3 minutes
        { size: 2, timeSpan: 0.75 }, // Very quick comparison of 2 sites
        { size: 3, timeSpan: 2 }, // Another 3-site comparison
        { size: 2, timeSpan: 1.5 }, // Medium-paced comparison
        { size: 3, timeSpan: 2.5 }, // Detailed look at 3 sites
      ];

      // Track our current offset in minutes
      let currentOffset = 0;

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

        // Add random gap between sessions (5-20 minutes)
        currentOffset += Math.floor(Math.random() * 15) + 5;

        // Generate entries for this session
        for (let i = 0; i < session.size; i++) {
          // Calculate time within session
          const progress = i / (session.size - 1);
          const sessionOffset = session.timeSpan * progress;
          const randomVariation = Math.random() * 0.25; // Up to 15 seconds variation

          const timestamp = new Date(
            Date.now() -
              (currentOffset + sessionOffset + randomVariation) * 60 * 1000,
          ).toISOString();
          fakeEntries.push(generateFakeEntry(timestamp));
        }

        currentOffset += session.timeSpan;
        entriesNeeded -= session.size;
      }

      // If we still need entries, add some individual scans
      while (entriesNeeded > 0) {
        // Random time in the remaining window (0-120 minutes)
        const randomMinutes = Math.random() * 120;
        const timestamp = new Date(
          Date.now() - randomMinutes * 60 * 1000,
        ).toISOString();
        fakeEntries.push(generateFakeEntry(timestamp));
        entriesNeeded--;
      }

      // Sort fake entries by timestamp
      fakeEntries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      // Insert fake entries one by one (more compatible with D1)
      let insertedCount = 0;
      for (const entry of fakeEntries) {
        try {
          await db
            .prepare(
              `
            INSERT INTO analyses (domain, url, timestamp, is_real) 
            VALUES (?, ?, ?, ?)
          `,
            )
            .bind(entry.domain, entry.url, entry.timestamp, 0)
            .run();
          insertedCount++;
        } catch (error) {
          console.error("History: Error inserting fake entry:", error, {
            entry,
          });
          // Continue with other entries even if one fails
        }
      }
      console.log(
        "History: Successfully inserted",
        insertedCount,
        "of",
        fakeEntries.length,
        "fake entries",
      );

      // Get final entries with limit
      let allEntries: HistoryEntry[];
      try {
        const result = await db
          .prepare(
            `
          SELECT domain, url, timestamp, is_real
          FROM analyses 
          ORDER BY timestamp DESC
          LIMIT 25
        `,
          )
          .all<HistoryEntry>();
        allEntries = result.results;
        console.log("History: Returning", allEntries.length, "total entries");
        json(200, allEntries);
      } catch (error) {
        console.error("History: Error fetching final entries:", error);
        // If we can't get the final entries, return what we have from earlier
        json(200, recentEntries);
      }
    } catch (error) {
      console.error("History: Database operation error:", error);
      throw json(500, {
        error: "Database operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("History: Fatal error:", error);
    if (error instanceof Response) {
      throw error; // Re-throw json responses (like 401)
    }
    throw json(500, {
      error: "Failed to fetch history",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
