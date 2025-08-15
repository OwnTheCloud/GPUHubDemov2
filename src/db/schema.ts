// DuckDB Schema Definition for GPU Hub Demo v2

export const DATABASE_SCHEMA = `
-- Owners table
CREATE TABLE IF NOT EXISTS owners (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    department VARCHAR,
    email VARCHAR,
    role VARCHAR
);

-- Assets table  
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR PRIMARY KEY,
    device_name VARCHAR NOT NULL,
    status VARCHAR CHECK (status IN ('active', 'inactive', 'maintenance', 'failure', 'pending')),
    owner_id VARCHAR REFERENCES owners(id),
    location VARCHAR,
    gpu_type VARCHAR CHECK (gpu_type IN ('h100', 'a100', 'v100', 'tesla', 'rtx')),
    instance_count INTEGER DEFAULT 1,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    network_bandwidth VARCHAR,
    created_date DATE,
    notes TEXT
);

-- Investigation Signals table
CREATE TABLE IF NOT EXISTS investigation_signals (
    signal_id VARCHAR PRIMARY KEY,
    signal_name VARCHAR NOT NULL,
    severity VARCHAR CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    description TEXT,
    asset_id VARCHAR REFERENCES assets(id),
    assigned_to VARCHAR REFERENCES owners(id)
);

-- Execution Signals table
CREATE TABLE IF NOT EXISTS execution_signals (
    mdmid VARCHAR PRIMARY KEY,
    status VARCHAR CHECK (status IN ('active', 'inactive', 'pending', 'failure')),
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    signal_type VARCHAR,
    threshold_value DECIMAL,
    current_value DECIMAL,
    description TEXT
);

-- Datacenters table
CREATE TABLE IF NOT EXISTS datacenters (
    datacenter_id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    region VARCHAR,
    status VARCHAR CHECK (status IN ('online', 'offline', 'maintenance', 'degraded')),
    capacity_total INTEGER,
    capacity_used INTEGER,
    location VARCHAR,
    tier VARCHAR CHECK (tier IN ('tier1', 'tier2', 'tier3', 'tier4')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stamps table
CREATE TABLE IF NOT EXISTS stamps (
    stamp_id VARCHAR PRIMARY KEY,
    stamp_name VARCHAR NOT NULL,
    datacenter_id VARCHAR REFERENCES datacenters(datacenter_id),
    status VARCHAR CHECK (status IN ('active', 'inactive', 'maintenance', 'decommissioned')),
    gpu_count INTEGER DEFAULT 0,
    cpu_count INTEGER DEFAULT 0,
    memory_gb INTEGER DEFAULT 0,
    created_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demand IDs table
CREATE TABLE IF NOT EXISTS demand_ids (
    demand_id VARCHAR PRIMARY KEY,
    customer VARCHAR NOT NULL,
    requested_gpus INTEGER NOT NULL,
    priority VARCHAR CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR CHECK (status IN ('pending', 'approved', 'provisioning', 'fulfilled', 'cancelled')),
    created_date DATE,
    fulfilled_date DATE,
    notes TEXT
);

-- Universal Supply table
CREATE TABLE IF NOT EXISTS universal_supply (
    supply_id VARCHAR PRIMARY KEY,
    region VARCHAR NOT NULL,
    gpu_type VARCHAR CHECK (gpu_type IN ('h100', 'a100', 'v100', 'tesla', 'rtx')),
    total_available INTEGER DEFAULT 0,
    allocated INTEGER DEFAULT 0,
    reserved INTEGER DEFAULT 0,
    maintenance INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard Metrics table (for historical data)
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    metric_id INTEGER PRIMARY KEY,
    metric_date DATE NOT NULL,
    gpu_utilization DECIMAL,
    total_signals INTEGER,
    active_investigations INTEGER,
    stamps_online INTEGER,
    demands_pending INTEGER,
    supply_available INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

// Type definitions for TypeScript
export interface Owner {
  id: string;
  name: string;
  department?: string;
  email?: string;
  role?: string;
}

export interface Asset {
  id: string;
  device_name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'failure' | 'pending';
  owner_id?: string;
  location?: string;
  gpu_type?: 'h100' | 'a100' | 'v100' | 'tesla' | 'rtx';
  instance_count?: number;
  last_updated?: Date;
  network_bandwidth?: string;
  created_date?: Date;
  notes?: string;
}

export interface InvestigationSignal {
  signal_id: string;
  signal_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  triggered_at?: Date;
  resolved_at?: Date;
  description?: string;
  asset_id?: string;
  assigned_to?: string;
}

export interface ExecutionSignal {
  mdmid: string;
  status: 'active' | 'inactive' | 'pending' | 'failure';
  triggered_at?: Date;
  signal_type?: string;
  threshold_value?: number;
  current_value?: number;
  description?: string;
}

export interface Datacenter {
  datacenter_id: string;
  name: string;
  region?: string;
  status: 'online' | 'offline' | 'maintenance' | 'degraded';
  capacity_total?: number;
  capacity_used?: number;
  location?: string;
  tier?: 'tier1' | 'tier2' | 'tier3' | 'tier4';
  last_updated?: Date;
}

export interface Stamp {
  stamp_id: string;
  stamp_name: string;
  datacenter_id?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  gpu_count?: number;
  cpu_count?: number;
  memory_gb?: number;
  created_date?: Date;
  last_updated?: Date;
}

export interface DemandID {
  demand_id: string;
  customer: string;
  requested_gpus: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'provisioning' | 'fulfilled' | 'cancelled';
  created_date?: Date;
  fulfilled_date?: Date;
  notes?: string;
}

export interface UniversalSupply {
  supply_id: string;
  region: string;
  gpu_type?: 'h100' | 'a100' | 'v100' | 'tesla' | 'rtx';
  total_available?: number;
  allocated?: number;
  reserved?: number;
  maintenance?: number;
  last_updated?: Date;
}

export interface DashboardMetric {
  metric_id: number;
  metric_date: Date;
  gpu_utilization?: number;
  total_signals?: number;
  active_investigations?: number;
  stamps_online?: number;
  demands_pending?: number;
  supply_available?: number;
  created_at?: Date;
}