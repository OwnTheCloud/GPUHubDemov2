import { sqljsManager as duckDBManager, queryDB, executeDB } from './sqljs-manager';
import type {
  Asset,
  Owner,
  InvestigationSignal,
  ExecutionSignal,
  Datacenter,
  Stamp,
  DemandID,
  UniversalSupply,
  DashboardMetric
} from './schema';

// ============ ASSETS QUERIES ============
export const assetQueries = {
  async getAll(): Promise<Asset[]> {
    return queryDB<Asset>(`
      SELECT 
        a.*,
        o.name as owner_name,
        o.email as owner_email
      FROM assets a
      LEFT JOIN owners o ON a.owner_id = o.id
      ORDER BY a.device_name
    `);
  },

  async getById(id: string): Promise<Asset | null> {
    const results = await queryDB<Asset>(
      'SELECT * FROM assets WHERE id = ?',
      [id]
    );
    return results[0] || null;
  },

  async create(asset: Omit<Asset, 'last_updated'>): Promise<void> {
    await executeDB(
      `INSERT INTO assets (id, device_name, status, owner_id, location, gpu_type, instance_count, network_bandwidth, created_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset.id, asset.device_name, asset.status, asset.owner_id, asset.location, 
       asset.gpu_type, asset.instance_count, asset.network_bandwidth, 
       asset.created_date?.toISOString().split('T')[0], asset.notes]
    );
  },

  async update(id: string, updates: Partial<Asset>): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'last_updated') {
        setClauses.push(`${key} = ?`);
        if (key === 'created_date' && value instanceof Date) {
          values.push(value.toISOString().split('T')[0]);
        } else {
          values.push(value);
        }
      }
    });
    
    if (setClauses.length > 0) {
      setClauses.push('last_updated = CURRENT_TIMESTAMP');
      values.push(id);
      
      await executeDB(
        `UPDATE assets SET ${setClauses.join(', ')} WHERE id = ?`,
        values
      );
    }
  },

  async delete(id: string): Promise<void> {
    await executeDB('DELETE FROM assets WHERE id = ?', [id]);
  },

  async getByStatus(status: string): Promise<Asset[]> {
    return queryDB<Asset>(
      'SELECT * FROM assets WHERE status = ? ORDER BY device_name',
      [status]
    );
  },

  async getByGpuType(gpuType: string): Promise<Asset[]> {
    return queryDB<Asset>(
      'SELECT * FROM assets WHERE gpu_type = ? ORDER BY device_name',
      [gpuType]
    );
  }
};

// ============ OWNERS QUERIES ============
export const ownerQueries = {
  async getAll(): Promise<Owner[]> {
    return queryDB<Owner>('SELECT * FROM owners ORDER BY name');
  },

  async getById(id: string): Promise<Owner | null> {
    const results = await queryDB<Owner>(
      'SELECT * FROM owners WHERE id = ?',
      [id]
    );
    return results[0] || null;
  },

  async create(owner: Owner): Promise<void> {
    await executeDB(
      `INSERT INTO owners (id, name, department, email, role)
       VALUES (?, ?, ?, ?, ?)`,
      [owner.id, owner.name, owner.department, owner.email, owner.role]
    );
  },

  async update(id: string, updates: Partial<Owner>): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id') {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (setClauses.length > 0) {
      values.push(id);
      await executeDB(
        `UPDATE owners SET ${setClauses.join(', ')} WHERE id = ?`,
        values
      );
    }
  }
};

// ============ INVESTIGATION SIGNALS QUERIES ============
export const investigationSignalQueries = {
  async getAll(): Promise<InvestigationSignal[]> {
    return queryDB<InvestigationSignal>(`
      SELECT 
        i.*,
        a.device_name as asset_name,
        o.name as assigned_to_name
      FROM investigation_signals i
      LEFT JOIN assets a ON i.asset_id = a.id
      LEFT JOIN owners o ON i.assigned_to = o.id
      ORDER BY i.triggered_at DESC
    `);
  },

  async getActive(): Promise<InvestigationSignal[]> {
    return queryDB<InvestigationSignal>(`
      SELECT * FROM investigation_signals 
      WHERE status IN ('active', 'investigating')
      ORDER BY severity DESC, triggered_at DESC
    `);
  },

  async create(signal: InvestigationSignal): Promise<void> {
    await executeDB(
      `INSERT INTO investigation_signals 
       (signal_id, signal_name, severity, status, triggered_at, resolved_at, description, asset_id, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [signal.signal_id, signal.signal_name, signal.severity, signal.status,
       signal.triggered_at?.toISOString(), signal.resolved_at?.toISOString(),
       signal.description, signal.asset_id, signal.assigned_to]
    );
  },

  async update(id: string, updates: Partial<InvestigationSignal>): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'signal_id') {
        setClauses.push(`${key} = ?`);
        if ((key === 'triggered_at' || key === 'resolved_at') && value instanceof Date) {
          values.push(value.toISOString());
        } else {
          values.push(value);
        }
      }
    });
    
    if (setClauses.length > 0) {
      values.push(id);
      await executeDB(
        `UPDATE investigation_signals SET ${setClauses.join(', ')} WHERE signal_id = ?`,
        values
      );
    }
  },

  async resolve(id: string): Promise<void> {
    await executeDB(
      `UPDATE investigation_signals 
       SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP 
       WHERE signal_id = ?`,
      [id]
    );
  }
};

// ============ EXECUTION SIGNALS QUERIES ============
export const executionSignalQueries = {
  async getAll(): Promise<ExecutionSignal[]> {
    return queryDB<ExecutionSignal>(`
      SELECT * FROM execution_signals 
      ORDER BY triggered_at DESC
    `);
  },

  async getActive(): Promise<ExecutionSignal[]> {
    return queryDB<ExecutionSignal>(`
      SELECT * FROM execution_signals 
      WHERE status = 'active'
      ORDER BY triggered_at DESC
    `);
  },

  async getWithDemands(): Promise<any[]> {
    // Join with demand_ids table if there's a relationship
    return queryDB(`
      SELECT 
        e.*,
        d.customer,
        d.requested_gpus,
        d.priority as demand_priority
      FROM execution_signals e
      LEFT JOIN demand_ids d ON d.demand_id = e.mdmid
      ORDER BY e.triggered_at DESC
    `);
  },

  async create(signal: ExecutionSignal): Promise<void> {
    await executeDB(
      `INSERT INTO execution_signals 
       (mdmid, status, triggered_at, signal_type, threshold_value, current_value, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [signal.mdmid, signal.status, signal.triggered_at?.toISOString(),
       signal.signal_type, signal.threshold_value, signal.current_value, signal.description]
    );
  },

  async update(mdmid: string, updates: Partial<ExecutionSignal>): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'mdmid') {
        setClauses.push(`${key} = ?`);
        if (key === 'triggered_at' && value instanceof Date) {
          values.push(value.toISOString());
        } else {
          values.push(value);
        }
      }
    });
    
    if (setClauses.length > 0) {
      values.push(mdmid);
      await executeDB(
        `UPDATE execution_signals SET ${setClauses.join(', ')} WHERE mdmid = ?`,
        values
      );
    }
  }
};

// ============ DATACENTERS QUERIES ============
export const datacenterQueries = {
  async getAll(): Promise<Datacenter[]> {
    return queryDB<Datacenter>(`
      SELECT * FROM datacenters 
      ORDER BY name
    `);
  },

  async getOnline(): Promise<Datacenter[]> {
    return queryDB<Datacenter>(`
      SELECT * FROM datacenters 
      WHERE status = 'online'
      ORDER BY name
    `);
  },

  async getWithCapacity(): Promise<any[]> {
    return queryDB(`
      SELECT 
        *,
        CAST((capacity_used * 100.0 / capacity_total) AS DECIMAL(5,2)) as utilization_percent
      FROM datacenters
      ORDER BY utilization_percent DESC
    `);
  },

  async update(id: string, updates: Partial<Datacenter>): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'datacenter_id' && key !== 'last_updated') {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (setClauses.length > 0) {
      setClauses.push('last_updated = CURRENT_TIMESTAMP');
      values.push(id);
      await executeDB(
        `UPDATE datacenters SET ${setClauses.join(', ')} WHERE datacenter_id = ?`,
        values
      );
    }
  }
};

// ============ STAMPS QUERIES ============
export const stampQueries = {
  async getAll(): Promise<Stamp[]> {
    return queryDB<Stamp>(`
      SELECT 
        s.*,
        d.name as datacenter_name,
        d.region
      FROM stamps s
      LEFT JOIN datacenters d ON s.datacenter_id = d.datacenter_id
      ORDER BY s.stamp_name
    `);
  },

  async getActive(): Promise<Stamp[]> {
    return queryDB<Stamp>(`
      SELECT * FROM stamps 
      WHERE status = 'active'
      ORDER BY stamp_name
    `);
  },

  async getByDatacenter(datacenterId: string): Promise<Stamp[]> {
    return queryDB<Stamp>(
      'SELECT * FROM stamps WHERE datacenter_id = ? ORDER BY stamp_name',
      [datacenterId]
    );
  },

  async update(id: string, updates: Partial<Stamp>): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'stamp_id' && key !== 'last_updated') {
        setClauses.push(`${key} = ?`);
        if (key === 'created_date' && value instanceof Date) {
          values.push(value.toISOString().split('T')[0]);
        } else {
          values.push(value);
        }
      }
    });
    
    if (setClauses.length > 0) {
      setClauses.push('last_updated = CURRENT_TIMESTAMP');
      values.push(id);
      await executeDB(
        `UPDATE stamps SET ${setClauses.join(', ')} WHERE stamp_id = ?`,
        values
      );
    }
  }
};

// ============ DEMAND IDS QUERIES ============
export const demandQueries = {
  async getAll(): Promise<DemandID[]> {
    return queryDB<DemandID>(`
      SELECT * FROM demand_ids 
      ORDER BY created_date DESC
    `);
  },

  async getPending(): Promise<DemandID[]> {
    return queryDB<DemandID>(`
      SELECT * FROM demand_ids 
      WHERE status IN ('pending', 'approved', 'provisioning')
      ORDER BY priority DESC, created_date ASC
    `);
  },

  async getByCustomer(customer: string): Promise<DemandID[]> {
    return queryDB<DemandID>(
      'SELECT * FROM demand_ids WHERE customer = ? ORDER BY created_date DESC',
      [customer]
    );
  },

  async create(demand: DemandID): Promise<void> {
    await executeDB(
      `INSERT INTO demand_ids 
       (demand_id, customer, requested_gpus, priority, status, created_date, fulfilled_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [demand.demand_id, demand.customer, demand.requested_gpus, demand.priority,
       demand.status, demand.created_date?.toISOString().split('T')[0],
       demand.fulfilled_date?.toISOString().split('T')[0], demand.notes]
    );
  },

  async update(id: string, updates: Partial<DemandID>): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'demand_id') {
        setClauses.push(`${key} = ?`);
        if ((key === 'created_date' || key === 'fulfilled_date') && value instanceof Date) {
          values.push(value.toISOString().split('T')[0]);
        } else {
          values.push(value);
        }
      }
    });
    
    if (setClauses.length > 0) {
      values.push(id);
      await executeDB(
        `UPDATE demand_ids SET ${setClauses.join(', ')} WHERE demand_id = ?`,
        values
      );
    }
  },

  async fulfill(id: string): Promise<void> {
    await executeDB(
      `UPDATE demand_ids 
       SET status = 'fulfilled', fulfilled_date = CURRENT_DATE 
       WHERE demand_id = ?`,
      [id]
    );
  }
};

// ============ UNIVERSAL SUPPLY QUERIES ============
export const supplyQueries = {
  async getAll(): Promise<UniversalSupply[]> {
    return queryDB<UniversalSupply>(`
      SELECT * FROM universal_supply 
      ORDER BY region, gpu_type
    `);
  },

  async getByRegion(region: string): Promise<UniversalSupply[]> {
    return queryDB<UniversalSupply>(
      'SELECT * FROM universal_supply WHERE region = ? ORDER BY gpu_type',
      [region]
    );
  },

  async getAvailableCapacity(): Promise<any[]> {
    return queryDB(`
      SELECT 
        region,
        gpu_type,
        total_available,
        (total_available - allocated - reserved - maintenance) as free_capacity,
        CAST(((allocated + reserved) * 100.0 / total_available) AS DECIMAL(5,2)) as utilization_percent
      FROM universal_supply
      WHERE total_available > 0
      ORDER BY utilization_percent DESC
    `);
  },

  async update(id: string, updates: Partial<UniversalSupply>): Promise<void> {
    const setClauses: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'supply_id' && key !== 'last_updated') {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (setClauses.length > 0) {
      setClauses.push('last_updated = CURRENT_TIMESTAMP');
      values.push(id);
      await executeDB(
        `UPDATE universal_supply SET ${setClauses.join(', ')} WHERE supply_id = ?`,
        values
      );
    }
  }
};

// ============ DASHBOARD METRICS QUERIES ============
export const dashboardQueries = {
  async getMetrics(days: number = 30): Promise<DashboardMetric[]> {
    return queryDB<DashboardMetric>(`
      SELECT * FROM dashboard_metrics 
      WHERE metric_date >= date('now', '-${days} days')
      ORDER BY metric_date
    `);
  },

  async getLatestMetrics(): Promise<DashboardMetric | null> {
    const results = await queryDB<DashboardMetric>(`
      SELECT * FROM dashboard_metrics 
      ORDER BY metric_date DESC 
      LIMIT 1
    `);
    return results[0] || null;
  },

  async getSummaryStats(): Promise<any> {
    const results = await queryDB(`
      SELECT 
        AVG(gpu_utilization) as avg_utilization,
        MAX(gpu_utilization) as max_utilization,
        AVG(total_signals) as avg_signals,
        SUM(demands_pending) as total_pending_demands
      FROM dashboard_metrics
      WHERE metric_date >= date('now', '-7 days')
    `);
    return results[0];
  },

  async recordMetric(metric: Omit<DashboardMetric, 'metric_id' | 'created_at'>): Promise<void> {
    // Get next metric_id
    const [maxId] = await queryDB<{ max_id: number }>('SELECT COALESCE(MAX(metric_id), 0) + 1 as max_id FROM dashboard_metrics');
    
    await executeDB(
      `INSERT INTO dashboard_metrics 
       (metric_id, metric_date, gpu_utilization, total_signals, active_investigations, stamps_online, demands_pending, supply_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [maxId.max_id, metric.metric_date.toISOString().split('T')[0], metric.gpu_utilization,
       metric.total_signals, metric.active_investigations, metric.stamps_online,
       metric.demands_pending, metric.supply_available]
    );
  }
};

// ============ AGGREGATION QUERIES ============
export const aggregationQueries = {
  async getAssetSummary(): Promise<any> {
    return queryDB(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_assets,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_assets,
        SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failed_assets,
        SUM(instance_count) as total_gpu_instances
      FROM assets
    `);
  },

  async getSignalSummary(): Promise<any> {
    return queryDB(`
      SELECT 
        COUNT(*) as total_signals,
        SUM(CASE WHEN status IN ('active', 'investigating') THEN 1 ELSE 0 END) as active_signals,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_signals,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_signals
      FROM investigation_signals
    `);
  },

  async getCapacitySummary(): Promise<any> {
    return queryDB(`
      SELECT 
        SUM(total_available) as total_capacity,
        SUM(allocated) as total_allocated,
        SUM(reserved) as total_reserved,
        SUM(total_available - allocated - reserved - maintenance) as total_free
      FROM universal_supply
    `);
  }
};

// Export all query modules
export const queries = {
  assets: assetQueries,
  owners: ownerQueries,
  investigationSignals: investigationSignalQueries,
  executionSignals: executionSignalQueries,
  datacenters: datacenterQueries,
  stamps: stampQueries,
  demands: demandQueries,
  supply: supplyQueries,
  dashboard: dashboardQueries,
  aggregations: aggregationQueries
};