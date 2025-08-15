// SQLite-compatible Schema Definition for GPU Hub Demo v2

export const DATABASE_SCHEMA = `
-- Owners table
CREATE TABLE IF NOT EXISTS owners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT,
    email TEXT,
    role TEXT
);

-- Assets table  
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    device_name TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'maintenance', 'failure', 'pending')),
    owner_id TEXT REFERENCES owners(id),
    location TEXT,
    gpu_type TEXT CHECK (gpu_type IN ('h100', 'a100', 'v100', 'tesla', 'rtx')),
    instance_count INTEGER DEFAULT 1,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    network_bandwidth TEXT,
    created_date DATE,
    notes TEXT
);

-- Investigation Signals table
CREATE TABLE IF NOT EXISTS investigation_signals (
    signal_id TEXT PRIMARY KEY,
    signal_name TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    description TEXT,
    asset_id TEXT REFERENCES assets(id),
    assigned_to TEXT REFERENCES owners(id)
);

-- Execution Signals table
CREATE TABLE IF NOT EXISTS execution_signals (
    mdmid TEXT PRIMARY KEY,
    status TEXT CHECK (status IN ('active', 'inactive', 'pending', 'failure')),
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    signal_type TEXT,
    threshold_value REAL,
    current_value REAL,
    description TEXT
);

-- Datacenters table
CREATE TABLE IF NOT EXISTS datacenters (
    datacenter_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT,
    status TEXT CHECK (status IN ('online', 'offline', 'maintenance', 'degraded')),
    capacity_total INTEGER,
    capacity_used INTEGER,
    location TEXT,
    tier TEXT CHECK (tier IN ('tier1', 'tier2', 'tier3', 'tier4')),
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stamps table
CREATE TABLE IF NOT EXISTS stamps (
    stamp_id TEXT PRIMARY KEY,
    stamp_name TEXT NOT NULL,
    datacenter_id TEXT REFERENCES datacenters(datacenter_id),
    status TEXT CHECK (status IN ('active', 'inactive', 'maintenance', 'decommissioned')),
    gpu_count INTEGER DEFAULT 0,
    cpu_count INTEGER DEFAULT 0,
    memory_gb INTEGER DEFAULT 0,
    created_date DATE,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Demand IDs table
CREATE TABLE IF NOT EXISTS demand_ids (
    demand_id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    requested_gpus INTEGER NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT CHECK (status IN ('pending', 'approved', 'provisioning', 'fulfilled', 'cancelled')),
    created_date DATE,
    fulfilled_date DATE,
    notes TEXT
);

-- Universal Supply table
CREATE TABLE IF NOT EXISTS universal_supply (
    supply_id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    gpu_type TEXT CHECK (gpu_type IN ('h100', 'a100', 'v100', 'tesla', 'rtx')),
    total_available INTEGER DEFAULT 0,
    allocated INTEGER DEFAULT 0,
    reserved INTEGER DEFAULT 0,
    maintenance INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard Metrics table (for historical data)
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    metric_id INTEGER PRIMARY KEY,
    metric_date DATE NOT NULL,
    gpu_utilization REAL,
    total_signals INTEGER,
    active_investigations INTEGER,
    stamps_online INTEGER,
    demands_pending INTEGER,
    supply_available INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_investigation_signals_status ON investigation_signals(status);
CREATE INDEX IF NOT EXISTS idx_investigation_signals_asset ON investigation_signals(asset_id);
CREATE INDEX IF NOT EXISTS idx_stamps_datacenter ON stamps(datacenter_id);
CREATE INDEX IF NOT EXISTS idx_demand_ids_status ON demand_ids(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_date ON dashboard_metrics(metric_date);
`;

// Export the same type definitions as before
export * from './schema';