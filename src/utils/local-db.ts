import type { D1Database, D1Result, D1PreparedStatement } from "../types/cloudflare";

// In-memory storage
const cache = new Map<string, any>();
const analyses = new Map<string, any>();
let analysisId = 1;

// Debug function to log database state
function logDbState(operation: string) {
  console.log('\n=== Database State ===');
  console.log('Operation:', operation);
  console.log('Cache entries:', cache.size);
  console.log('Analysis entries:', analyses.size);
  console.log('Analyses:', Array.from(analyses.values()));
  console.log('==================\n');
}

class LocalPreparedStatement implements D1PreparedStatement {
  private query: string;
  private values: any[] = [];

  constructor(query: string) {
    this.query = query.toLowerCase();
    console.log('Query:', query);
    console.log('Values:', this.values);
  }

  bind(...values: any[]): D1PreparedStatement {
    this.values = values;
    console.log('Binding values:', values);
    return this;
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    if (this.query.includes("from cache")) {
      if (this.query.includes("where domain =")) {
        const domain = this.values[0];
        const result = cache.get(domain);
        logDbState(`Cache lookup for ${domain}`);
        return { results: result ? [result] : [], success: true };
      }
      logDbState('List all cache');
      return { results: Array.from(cache.values()), success: true };
    }

    if (this.query.includes("from analyses")) {
      let results = Array.from(analyses.values());
      console.log('Initial results:', results);

      // Apply WHERE clause if present
      if (this.query.includes("where is_real = 1")) {
        console.log('Filtering for real entries...');
        results = results.filter(entry => {
          console.log('Entry:', entry, 'is_real:', entry.is_real);
          return entry.is_real === true;
        });
        console.log('After is_real filter:', results);
      }

      // Sort by timestamp if requested
      if (this.query.includes("order by timestamp desc")) {
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        console.log('After sorting:', results);
      }

      // Apply LIMIT if present
      if (this.query.includes("limit 25")) {
        results = results.slice(0, 25);
        console.log('After limit:', results);
      }

      logDbState('Query analyses');
      return { results: results as T[], success: true };
    }

    return { results: [], success: true };
  }

  async run(): Promise<D1Result> {
    if (this.query.includes("insert into cache")) {
      const [domain, result] = this.values;
      cache.set(domain, { result, timestamp: new Date().toISOString() });
      logDbState(`Cache insert for ${domain}`);
      return { results: [], success: true, changes: 1 };
    }

    if (this.query.includes("insert into analyses")) {
      const [domain, url] = this.values;
      console.log('Inserting analysis:', { domain, url });

      // Check for existing entry in the last minute
      const recentEntry = Array.from(analyses.values()).find(entry => {
        const age = Date.now() - new Date(entry.timestamp).getTime();
        return entry.domain === domain && age < 60000;
      });

      if (recentEntry) {
        console.log('Found recent entry, skipping insert');
        return { results: [], success: true, changes: 0 };
      }

      const id = analysisId++;
      const entry = {
        id,
        domain,
        url,
        timestamp: new Date().toISOString(),
        is_real: true // Always true for real entries
      };
      console.log('Created entry:', entry);
      analyses.set(id.toString(), entry);
      logDbState(`Analysis insert for ${domain}`);
      return { results: [], success: true, changes: 1 };
    }

    if (this.query.includes("delete from cache")) {
      let changes = 0;
      for (const [key, value] of cache.entries()) {
        const age = Date.now() - new Date(value.timestamp).getTime();
        if (age > 24 * 60 * 60 * 1000) {
          cache.delete(key);
          changes++;
        }
      }
      logDbState('Cache cleanup');
      return { results: [], success: true, changes };
    }

    if (this.query.includes("delete from analyses")) {
      let changes = 0;
      for (const [key, value] of analyses.entries()) {
        if (!value.is_real) {
          const age = Date.now() - new Date(value.timestamp).getTime();
          if (age > 60 * 60 * 1000) {
            analyses.delete(key);
            changes++;
          }
        }
      }
      logDbState('Analysis cleanup');
      return { results: [], success: true, changes };
    }

    return { results: [], success: true, changes: 0 };
  }
}

export function createLocalDB(): D1Database {
  console.log('Creating local DB instance');
  return {
    prepare(query: string): D1PreparedStatement {
      console.log('Local DB preparing query:', query);
      return new LocalPreparedStatement(query);
    },
    async dump(): Promise<ArrayBuffer> {
      throw new Error("Not implemented");
    },
    async batch<T>(): Promise<D1Result<T>[]> {
      throw new Error("Not implemented");
    }
  };
} 