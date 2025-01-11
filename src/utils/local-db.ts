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
    this.query = query;
    console.log('Query:', query);
    console.log('Values:', this.values);
  }

  bind(...values: any[]): D1PreparedStatement {
    this.values = values.map(value => {
      // Convert JavaScript types to SQL types
      if (typeof value === 'boolean') {
        return value ? 1 : 0; // SQLite stores booleans as integers
      }
      return value;
    });
    console.log('Binding values:', this.values);
    return this;
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    // Parse the SQL query to determine the operation
    const normalizedQuery = this.query.toLowerCase().trim();
    
    if (normalizedQuery.startsWith('select')) {
      let results = Array.from(analyses.values());

      // Handle WHERE clauses
      if (normalizedQuery.includes('where')) {
        const whereClause = normalizedQuery.split('where')[1].split('order')[0].trim();
        
        if (whereClause.includes('is_real = 1') || whereClause.includes('is_real = true')) {
          results = results.filter(entry => entry.is_real === true);
        } else if (whereClause.includes('is_real = 0') || whereClause.includes('is_real = false')) {
          results = results.filter(entry => entry.is_real === false);
        }
      }

      // Handle ORDER BY
      if (normalizedQuery.includes('order by timestamp desc')) {
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      logDbState('Query analyses');
      return { results: results as T[], success: true };
    }

    return { results: [], success: true };
  }

  async run(): Promise<D1Result> {
    const normalizedQuery = this.query.toLowerCase().trim();

    if (normalizedQuery.startsWith('insert into analyses')) {
      let changes = 0;
      const valueGroups = this.values.length / 4;

      for (let i = 0; i < valueGroups; i++) {
        const baseIndex = i * 4;
        const domain = this.values[baseIndex];
        const url = this.values[baseIndex + 1];
        const timestamp = this.values[baseIndex + 2];
        const is_real = Boolean(this.values[baseIndex + 3]); // Convert SQLite integer to boolean

        const id = analysisId++;
        const entry = {
          id,
          domain,
          url,
          timestamp,
          is_real
        };
        analyses.set(id.toString(), entry);
        changes++;
      }

      logDbState(`Analysis insert - ${changes} rows`);
      return { results: [], success: true, changes };
    }

    if (normalizedQuery.startsWith('delete from analyses')) {
      let changes = 0;
      const whereClause = normalizedQuery.split('where')[1]?.trim();

      if (whereClause?.includes('is_real = 0') || whereClause?.includes('is_real = false')) {
        for (const [key, value] of analyses.entries()) {
          if (!value.is_real) {
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