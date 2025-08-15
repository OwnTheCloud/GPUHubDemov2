import * as duckdb from '@duckdb/duckdb-wasm';
import { DATABASE_SCHEMA } from './schema';

class DuckDBManager {
  private db: duckdb.AsyncDuckDB | null = null;
  private connection: duckdb.AsyncDuckDBConnection | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // Return existing initialization if in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.initialized && this.db && this.connection) {
      return;
    }

    // Start initialization
    this.initPromise = this.doInitialize();
    
    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  private async doInitialize(): Promise<void> {
    try {
      console.log('Initializing DuckDB WASM...');
      
      // Use manual bundle configuration
      const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
        mvp: {
          mainModule: '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm',
          mainWorker: '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js',
        },
        eh: {
          mainModule: '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-eh.wasm',
          mainWorker: '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js',
        },
      };

      // Select bundle
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
      
      // Create worker with the URL
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();
      
      // Instantiate DuckDB
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      
      // Open database
      await this.db.open({
        path: ':memory:', // Use in-memory database for browser
        query: {
          // Enable all extensions we might need
          'enable_external_access': 'true',
        }
      });
      
      // Create connection
      this.connection = await this.db.connect();
      
      // Create schema
      await this.createSchema();
      
      this.initialized = true;
      console.log('DuckDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DuckDB:', error);
      throw error;
    }
  }

  private async createSchema(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }

    try {
      // Execute the schema creation SQL
      await this.connection.query(DATABASE_SCHEMA);
      console.log('Database schema created successfully');
    } catch (error) {
      console.error('Failed to create schema:', error);
      throw error;
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    await this.ensureInitialized();
    
    if (!this.connection) {
      throw new Error('Database connection not available');
    }

    try {
      let result;
      if (params && params.length > 0) {
        // Prepare statement with parameters
        const stmt = await this.connection.prepare(sql);
        result = await stmt.query(...params);
        stmt.close();
      } else {
        // Direct query without parameters
        result = await this.connection.query(sql);
      }
      
      // Convert Arrow table to JSON
      const data = result.toArray().map((row: any) => {
        return row.toJSON();
      });
      
      return data as T[];
    } catch (error) {
      console.error('Query failed:', sql, error);
      throw error;
    }
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.connection) {
      throw new Error('Database connection not available');
    }

    try {
      if (params && params.length > 0) {
        // Prepare statement with parameters
        const stmt = await this.connection.prepare(sql);
        await stmt.query(...params);
        stmt.close();
      } else {
        // Direct execution without parameters
        await this.connection.query(sql);
      }
    } catch (error) {
      console.error('Execute failed:', sql, error);
      throw error;
    }
  }

  async insertMany(table: string, records: any[]): Promise<void> {
    if (records.length === 0) return;
    
    await this.ensureInitialized();
    
    if (!this.connection) {
      throw new Error('Database connection not available');
    }

    try {
      // Create a table from the JSON data
      await this.connection.insertJSONFromPath(
        JSON.stringify(records),
        { 
          name: table,
          create: false, // Don't create table, it should already exist
          schema: 'main'
        }
      );
    } catch (error) {
      console.error(`Failed to insert records into ${table}:`, error);
      throw error;
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.ensureInitialized();
    
    if (!this.connection) {
      throw new Error('Database connection not available');
    }

    try {
      await this.connection.query('BEGIN TRANSACTION');
      const result = await fn();
      await this.connection.query('COMMIT');
      return result;
    } catch (error) {
      await this.connection.query('ROLLBACK');
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    
    if (this.db) {
      await this.db.terminate();
      this.db = null;
    }
    
    this.initialized = false;
  }

  // Utility method to check if database is ready
  isReady(): boolean {
    return this.initialized && this.db !== null && this.connection !== null;
  }

  // Get table info for debugging
  async getTableInfo(tableName: string): Promise<any[]> {
    return this.query(`PRAGMA table_info('${tableName}')`);
  }

  // Get all tables in the database
  async getTables(): Promise<string[]> {
    const result = await this.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    return result.map(row => row.name);
  }
}

// Export singleton instance
export const duckDBManager = new DuckDBManager();

// Export convenience functions
export const initializeDB = () => duckDBManager.initialize();
export const queryDB = <T = any>(sql: string, params?: any[]) => duckDBManager.query<T>(sql, params);
export const executeDB = (sql: string, params?: any[]) => duckDBManager.execute(sql, params);
export const insertManyDB = (table: string, records: any[]) => duckDBManager.insertMany(table, records);