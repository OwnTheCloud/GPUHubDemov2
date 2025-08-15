import initSqlJs, { Database } from 'sql.js';

class SQLJSManager {
  private db: Database | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // Return existing initialization if in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.initialized && this.db) {
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
      console.log('Initializing SQL.js...');
      
      // Initialize SQL.js with WASM file from CDN
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      // Create new database
      this.db = new SQL.Database();
      
      // Enable foreign keys (though SQLite doesn't enforce them strictly)
      this.db.run("PRAGMA foreign_keys = ON;");
      
      // Create schema with individual table creation
      this.createTables();
      
      this.initialized = true;
      console.log('SQL.js initialized successfully');
      
      // Log created tables for debugging - after initialization
      const tables = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      const tableNames = tables[0]?.values.map(row => row[0]) || [];
      console.log('Created tables:', tableNames);
      
    } catch (error) {
      console.error('Failed to initialize SQL.js:', error);
      throw error;
    }
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');
    
    console.log('Creating database tables...');
    
    // Test if database is working
    try {
      this.db.run("CREATE TABLE test (id INTEGER)");
      this.db.run("DROP TABLE test");
      console.log('Database is working, creating tables...');
    } catch (e) {
      console.error('Database test failed:', e);
      throw e;
    }
    
    // Create tables one by one with error handling
    const tables = [
      // Owners table
      `CREATE TABLE IF NOT EXISTS owners (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT,
        email TEXT,
        role TEXT
      )`,
      
      // Assets table - simplified without foreign key constraint
      `CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        device_name TEXT NOT NULL,
        status TEXT,
        owner_id TEXT,
        location TEXT,
        gpu_type TEXT,
        instance_count INTEGER DEFAULT 1,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        network_bandwidth TEXT,
        created_date DATE,
        notes TEXT
      )`,
      
      // Investigation Signals table
      `CREATE TABLE IF NOT EXISTS investigation_signals (
        signal_id TEXT PRIMARY KEY,
        signal_name TEXT NOT NULL,
        severity TEXT,
        status TEXT,
        triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        description TEXT,
        asset_id TEXT,
        assigned_to TEXT
      )`,
      
      // Execution Signals table
      `CREATE TABLE IF NOT EXISTS execution_signals (
        mdmid TEXT PRIMARY KEY,
        status TEXT,
        triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        signal_type TEXT,
        threshold_value REAL,
        current_value REAL,
        description TEXT
      )`,
      
      // Datacenters table
      `CREATE TABLE IF NOT EXISTS datacenters (
        datacenter_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        region TEXT,
        status TEXT,
        capacity_total INTEGER,
        capacity_used INTEGER,
        location TEXT,
        tier TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Stamps table
      `CREATE TABLE IF NOT EXISTS stamps (
        stamp_id TEXT PRIMARY KEY,
        stamp_name TEXT NOT NULL,
        datacenter_id TEXT,
        status TEXT,
        gpu_count INTEGER DEFAULT 0,
        cpu_count INTEGER DEFAULT 0,
        memory_gb INTEGER DEFAULT 0,
        created_date DATE,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Demand IDs table
      `CREATE TABLE IF NOT EXISTS demand_ids (
        demand_id TEXT PRIMARY KEY,
        customer TEXT NOT NULL,
        requested_gpus INTEGER NOT NULL,
        priority TEXT,
        status TEXT,
        created_date DATE,
        fulfilled_date DATE,
        notes TEXT
      )`,
      
      // Universal Supply table
      `CREATE TABLE IF NOT EXISTS universal_supply (
        supply_id TEXT PRIMARY KEY,
        region TEXT NOT NULL,
        gpu_type TEXT,
        total_available INTEGER DEFAULT 0,
        allocated INTEGER DEFAULT 0,
        reserved INTEGER DEFAULT 0,
        maintenance INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Dashboard Metrics table
      `CREATE TABLE IF NOT EXISTS dashboard_metrics (
        metric_id INTEGER PRIMARY KEY,
        metric_date DATE NOT NULL,
        gpu_utilization REAL,
        total_signals INTEGER,
        active_investigations INTEGER,
        stamps_online INTEGER,
        demands_pending INTEGER,
        supply_available INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    // Create indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_id)`,
      `CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status)`,
      `CREATE INDEX IF NOT EXISTS idx_investigation_signals_status ON investigation_signals(status)`,
      `CREATE INDEX IF NOT EXISTS idx_investigation_signals_asset ON investigation_signals(asset_id)`,
      `CREATE INDEX IF NOT EXISTS idx_stamps_datacenter ON stamps(datacenter_id)`,
      `CREATE INDEX IF NOT EXISTS idx_demand_ids_status ON demand_ids(status)`,
      `CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_date ON dashboard_metrics(metric_date)`
    ];
    
    // Execute each table creation
    for (const sql of tables) {
      try {
        this.db.run(sql);
        const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
        console.log(`✓ Created table: ${tableName}`);
      } catch (error) {
        console.error('Failed to create table:', error);
        console.error('SQL:', sql.substring(0, 100) + '...');
        throw error;
      }
    }
    
    // Create indexes
    for (const sql of indexes) {
      try {
        this.db.run(sql);
      } catch (error) {
        console.warn('Index creation warning:', error);
      }
    }
    
    console.log('All tables created successfully');
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    await this.ensureInitialized();
    
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      const stmt = this.db.prepare(sql);
      
      if (params && params.length > 0) {
        // Clean parameters - convert undefined to null
        const cleanParams = params.map(p => p === undefined ? null : p);
        stmt.bind(cleanParams);
      }
      
      const results: T[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row as T);
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('Query failed:', sql, error);
      throw error;
    }
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    await this.ensureInitialized();
    
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      if (params && params.length > 0) {
        // Clean parameters - convert undefined to null
        const cleanParams = params.map(p => p === undefined ? null : p);
        const stmt = this.db.prepare(sql);
        stmt.bind(cleanParams);
        stmt.step();
        stmt.free();
      } else {
        this.db.run(sql);
      }
    } catch (error) {
      console.error('Execute failed:', sql, error);
      console.error('Parameters:', params);
      throw error;
    }
  }

  async insertMany(table: string, records: any[]): Promise<void> {
    if (records.length === 0) return;
    
    await this.ensureInitialized();
    
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      // Get column names from first record
      const columns = Object.keys(records[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
      
      const stmt = this.db.prepare(sql);
      
      for (const record of records) {
        const values = columns.map(col => {
          const value = record[col];
          // Convert Date objects to ISO strings
          if (value instanceof Date) {
            return value.toISOString();
          }
          // Convert undefined to null
          if (value === undefined) {
            return null;
          }
          return value;
        });
        
        stmt.bind(values);
        stmt.step();
        stmt.reset();
      }
      
      stmt.free();
    } catch (error) {
      console.error(`Failed to insert records into ${table}:`, error);
      throw error;
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.ensureInitialized();
    
    if (!this.db) {
      throw new Error('Database not available');
    }

    try {
      this.db.run('BEGIN TRANSACTION');
      const result = await fn();
      this.db.run('COMMIT');
      return result;
    } catch (error) {
      this.db.run('ROLLBACK');
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    this.initialized = false;
  }

  // Utility method to check if database is ready
  isReady(): boolean {
    return this.initialized && this.db !== null;
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

  // Export database to file (for debugging/backup)
  exportDatabase(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }
}

// Export singleton instance
export const sqljsManager = new SQLJSManager();

// Export convenience functions
export const initializeDB = () => sqljsManager.initialize();
export const queryDB = <T = any>(sql: string, params?: any[]) => sqljsManager.query<T>(sql, params);
export const executeDB = (sql: string, params?: any[]) => sqljsManager.execute(sql, params);
export const insertManyDB = (table: string, records: any[]) => sqljsManager.insertMany(table, records);