import { sqljsManager as duckDBManager } from './sqljs-manager';
import type { 
  Owner, 
  Asset, 
  InvestigationSignal, 
  ExecutionSignal,
  Datacenter,
  Stamp,
  DemandID,
  UniversalSupply,
  DashboardMetric
} from './schema';

// Generate seed data for all tables
export function generateSeedData() {
  // Owners data
  const owners: Owner[] = [
    { id: 'owner-1', name: 'Infrastructure Team', department: 'IT Operations', email: 'infra@gpuhub.com', role: 'Team' },
    { id: 'owner-2', name: 'AI Research Team', department: 'Research', email: 'ai-research@gpuhub.com', role: 'Team' },
    { id: 'owner-3', name: 'Platform Engineering', department: 'Engineering', email: 'platform@gpuhub.com', role: 'Team' },
    { id: 'owner-4', name: 'Data Science Team', department: 'Analytics', email: 'datascience@gpuhub.com', role: 'Team' },
    { id: 'owner-5', name: 'John Smith', department: 'IT Operations', email: 'john.smith@gpuhub.com', role: 'Engineer' },
    { id: 'owner-6', name: 'Sarah Johnson', department: 'Research', email: 'sarah.johnson@gpuhub.com', role: 'Scientist' },
    { id: 'owner-7', name: 'Mike Chen', department: 'Engineering', email: 'mike.chen@gpuhub.com', role: 'Architect' },
  ];

  // Assets data (GPU clusters and nodes)
  const assets: Asset[] = [
    { id: 'gpu-cluster-001', device_name: 'H100 Cluster Alpha', status: 'active', owner_id: 'owner-1', location: 'US-East-1', gpu_type: 'h100', instance_count: 8, network_bandwidth: '400 Gbps', created_date: new Date('2024-01-15'), notes: 'Primary training cluster' },
    { id: 'gpu-cluster-002', device_name: 'A100 Cluster Beta', status: 'active', owner_id: 'owner-2', location: 'US-West-2', gpu_type: 'a100', instance_count: 16, network_bandwidth: '200 Gbps', created_date: new Date('2023-11-20'), notes: 'Research cluster' },
    { id: 'gpu-node-003', device_name: 'V100 Node 1', status: 'maintenance', owner_id: 'owner-3', location: 'EU-Central-1', gpu_type: 'v100', instance_count: 4, network_bandwidth: '100 Gbps', created_date: new Date('2023-08-10'), notes: 'Scheduled maintenance' },
    { id: 'gpu-cluster-004', device_name: 'H100 Cluster Gamma', status: 'active', owner_id: 'owner-4', location: 'Asia-Pacific-1', gpu_type: 'h100', instance_count: 12, network_bandwidth: '400 Gbps', created_date: new Date('2024-02-01'), notes: 'Analytics workloads' },
    { id: 'gpu-node-005', device_name: 'RTX 4090 Workstation', status: 'active', owner_id: 'owner-5', location: 'US-East-1', gpu_type: 'rtx', instance_count: 2, network_bandwidth: '10 Gbps', created_date: new Date('2024-03-15'), notes: 'Development workstation' },
    { id: 'gpu-cluster-006', device_name: 'A100 Cluster Delta', status: 'failure', owner_id: 'owner-1', location: 'US-Central-1', gpu_type: 'a100', instance_count: 8, network_bandwidth: '200 Gbps', created_date: new Date('2023-09-01'), notes: 'Hardware failure - awaiting replacement' },
    { id: 'gpu-node-007', device_name: 'Tesla T4 Edge Node', status: 'inactive', owner_id: 'owner-6', location: 'EU-West-1', gpu_type: 'tesla', instance_count: 1, network_bandwidth: '25 Gbps', created_date: new Date('2023-05-20'), notes: 'Edge inference node' },
    { id: 'gpu-cluster-008', device_name: 'H100 Cluster Epsilon', status: 'pending', owner_id: 'owner-7', location: 'US-West-1', gpu_type: 'h100', instance_count: 24, network_bandwidth: '800 Gbps', created_date: new Date('2024-04-01'), notes: 'Pending deployment' },
  ];

  // Investigation Signals
  const investigationSignals: InvestigationSignal[] = [
    { signal_id: 'sig-001', signal_name: 'High GPU Memory Usage', severity: 'high', status: 'active', triggered_at: new Date('2024-04-10T08:30:00'), description: 'GPU memory usage exceeding 95% for over 30 minutes', asset_id: 'gpu-cluster-001', assigned_to: 'owner-5' },
    { signal_id: 'sig-002', signal_name: 'Temperature Threshold Exceeded', severity: 'critical', status: 'investigating', triggered_at: new Date('2024-04-10T09:15:00'), description: 'GPU temperature above 85°C', asset_id: 'gpu-cluster-002', assigned_to: 'owner-1' },
    { signal_id: 'sig-003', signal_name: 'Network Latency Spike', severity: 'medium', status: 'resolved', triggered_at: new Date('2024-04-09T14:20:00'), resolved_at: new Date('2024-04-09T16:45:00'), description: 'Inter-node latency increased by 200%', asset_id: 'gpu-cluster-004', assigned_to: 'owner-3' },
    { signal_id: 'sig-004', signal_name: 'Power Consumption Anomaly', severity: 'low', status: 'false_positive', triggered_at: new Date('2024-04-08T11:00:00'), resolved_at: new Date('2024-04-08T11:30:00'), description: 'Unexpected power draw pattern detected', asset_id: 'gpu-node-005' },
    { signal_id: 'sig-005', signal_name: 'Driver Version Mismatch', severity: 'medium', status: 'active', triggered_at: new Date('2024-04-10T07:00:00'), description: 'CUDA driver version inconsistency detected', asset_id: 'gpu-node-003', assigned_to: 'owner-6' },
    { signal_id: 'sig-006', signal_name: 'Hardware Error Rate Increase', severity: 'critical', status: 'investigating', triggered_at: new Date('2024-04-10T10:30:00'), description: 'ECC error rate above acceptable threshold', asset_id: 'gpu-cluster-006', assigned_to: 'owner-1' },
  ];

  // Execution Signals (linked to Demand IDs)
  const executionSignals: ExecutionSignal[] = [
    { mdmid: 'mdm-001', status: 'active', triggered_at: new Date('2024-04-10T06:00:00'), signal_type: 'capacity_alert', threshold_value: 80, current_value: 85, description: 'Capacity utilization above threshold' },
    { mdmid: 'mdm-002', status: 'active', triggered_at: new Date('2024-04-10T07:30:00'), signal_type: 'demand_spike', threshold_value: 100, current_value: 150, description: 'Demand exceeding available capacity' },
    { mdmid: 'mdm-003', status: 'inactive', triggered_at: new Date('2024-04-09T12:00:00'), signal_type: 'efficiency_drop', threshold_value: 90, current_value: 75, description: 'Compute efficiency below target' },
    { mdmid: 'mdm-004', status: 'pending', triggered_at: new Date('2024-04-10T08:00:00'), signal_type: 'scaling_trigger', threshold_value: 70, current_value: 72, description: 'Auto-scaling threshold reached' },
    { mdmid: 'mdm-005', status: 'failure', triggered_at: new Date('2024-04-10T09:00:00'), signal_type: 'provisioning_error', description: 'Failed to provision requested resources' },
  ];

  // Datacenters
  const datacenters: Datacenter[] = [
    { datacenter_id: 'dc-us-east-1', name: 'US East Primary', region: 'US-East', status: 'online', capacity_total: 1000, capacity_used: 750, location: 'Virginia, USA', tier: 'tier4' },
    { datacenter_id: 'dc-us-west-2', name: 'US West Secondary', region: 'US-West', status: 'online', capacity_total: 800, capacity_used: 600, location: 'Oregon, USA', tier: 'tier4' },
    { datacenter_id: 'dc-eu-central-1', name: 'EU Central Hub', region: 'EU-Central', status: 'maintenance', capacity_total: 600, capacity_used: 400, location: 'Frankfurt, Germany', tier: 'tier3' },
    { datacenter_id: 'dc-asia-pac-1', name: 'Asia Pacific Primary', region: 'Asia-Pacific', status: 'online', capacity_total: 500, capacity_used: 450, location: 'Singapore', tier: 'tier4' },
    { datacenter_id: 'dc-us-central-1', name: 'US Central', region: 'US-Central', status: 'degraded', capacity_total: 400, capacity_used: 200, location: 'Texas, USA', tier: 'tier3' },
  ];

  // Stamps (clusters within datacenters)
  const stamps: Stamp[] = [
    { stamp_id: 'stamp-001', stamp_name: 'H100-Production-A', datacenter_id: 'dc-us-east-1', status: 'active', gpu_count: 128, cpu_count: 256, memory_gb: 8192, created_date: new Date('2024-01-01') },
    { stamp_id: 'stamp-002', stamp_name: 'A100-Research-B', datacenter_id: 'dc-us-west-2', status: 'active', gpu_count: 64, cpu_count: 128, memory_gb: 4096, created_date: new Date('2023-11-15') },
    { stamp_id: 'stamp-003', stamp_name: 'V100-Legacy-C', datacenter_id: 'dc-eu-central-1', status: 'maintenance', gpu_count: 32, cpu_count: 64, memory_gb: 2048, created_date: new Date('2023-06-01') },
    { stamp_id: 'stamp-004', stamp_name: 'H100-Training-D', datacenter_id: 'dc-asia-pac-1', status: 'active', gpu_count: 96, cpu_count: 192, memory_gb: 6144, created_date: new Date('2024-02-15') },
    { stamp_id: 'stamp-005', stamp_name: 'Mixed-GPU-E', datacenter_id: 'dc-us-central-1', status: 'inactive', gpu_count: 48, cpu_count: 96, memory_gb: 3072, created_date: new Date('2023-09-01') },
    { stamp_id: 'stamp-006', stamp_name: 'H100-Inference-F', datacenter_id: 'dc-us-east-1', status: 'active', gpu_count: 80, cpu_count: 160, memory_gb: 5120, created_date: new Date('2024-03-01') },
  ];

  // Demand IDs (customer requests)
  const demandIds: DemandID[] = [
    { demand_id: 'demand-001', customer: 'Enterprise AI Corp', requested_gpus: 32, priority: 'high', status: 'fulfilled', created_date: new Date('2024-04-01'), fulfilled_date: new Date('2024-04-03'), notes: 'LLM training workload' },
    { demand_id: 'demand-002', customer: 'Research Labs Inc', requested_gpus: 16, priority: 'medium', status: 'provisioning', created_date: new Date('2024-04-08'), notes: 'Scientific computing project' },
    { demand_id: 'demand-003', customer: 'StartupML', requested_gpus: 8, priority: 'low', status: 'pending', created_date: new Date('2024-04-09'), notes: 'Proof of concept development' },
    { demand_id: 'demand-004', customer: 'BigData Analytics', requested_gpus: 64, priority: 'critical', status: 'approved', created_date: new Date('2024-04-10'), notes: 'Urgent batch processing job' },
    { demand_id: 'demand-005', customer: 'CloudVision AI', requested_gpus: 24, priority: 'high', status: 'cancelled', created_date: new Date('2024-04-05'), notes: 'Project postponed' },
    { demand_id: 'demand-006', customer: 'Quantum Research', requested_gpus: 48, priority: 'medium', status: 'pending', created_date: new Date('2024-04-10'), notes: 'Quantum simulation workload' },
    { demand_id: 'demand-007', customer: 'AutoML Platform', requested_gpus: 12, priority: 'low', status: 'provisioning', created_date: new Date('2024-04-07'), notes: 'AutoML pipeline execution' },
  ];

  // Universal Supply
  const universalSupply: UniversalSupply[] = [
    { supply_id: 'supply-001', region: 'US-East', gpu_type: 'h100', total_available: 256, allocated: 200, reserved: 32, maintenance: 24 },
    { supply_id: 'supply-002', region: 'US-West', gpu_type: 'h100', total_available: 128, allocated: 96, reserved: 16, maintenance: 16 },
    { supply_id: 'supply-003', region: 'US-East', gpu_type: 'a100', total_available: 192, allocated: 150, reserved: 24, maintenance: 18 },
    { supply_id: 'supply-004', region: 'EU-Central', gpu_type: 'v100', total_available: 64, allocated: 32, reserved: 8, maintenance: 24 },
    { supply_id: 'supply-005', region: 'Asia-Pacific', gpu_type: 'h100', total_available: 96, allocated: 80, reserved: 8, maintenance: 8 },
    { supply_id: 'supply-006', region: 'US-Central', gpu_type: 'a100', total_available: 80, allocated: 40, reserved: 10, maintenance: 30 },
    { supply_id: 'supply-007', region: 'US-West', gpu_type: 'rtx', total_available: 32, allocated: 24, reserved: 4, maintenance: 4 },
  ];

  // Dashboard Metrics (historical data for charts)
  const dashboardMetrics: DashboardMetric[] = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    dashboardMetrics.push({
      metric_id: 31 - i,
      metric_date: date,
      gpu_utilization: 65 + Math.random() * 25, // 65-90%
      total_signals: Math.floor(10 + Math.random() * 20),
      active_investigations: Math.floor(2 + Math.random() * 8),
      stamps_online: Math.floor(4 + Math.random() * 2),
      demands_pending: Math.floor(3 + Math.random() * 10),
      supply_available: Math.floor(100 + Math.random() * 200),
    });
  }

  return {
    owners,
    assets,
    investigationSignals,
    executionSignals,
    datacenters,
    stamps,
    demandIds,
    universalSupply,
    dashboardMetrics
  };
}

// Function to seed the database
export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Generate seed data
    const seedData = generateSeedData();
    
    // Clear existing data (optional - remove in production)
    await duckDBManager.execute('DELETE FROM dashboard_metrics');
    await duckDBManager.execute('DELETE FROM demand_ids');
    await duckDBManager.execute('DELETE FROM universal_supply');
    await duckDBManager.execute('DELETE FROM stamps');
    await duckDBManager.execute('DELETE FROM datacenters');
    await duckDBManager.execute('DELETE FROM execution_signals');
    await duckDBManager.execute('DELETE FROM investigation_signals');
    await duckDBManager.execute('DELETE FROM assets');
    await duckDBManager.execute('DELETE FROM owners');
    
    // Insert data in correct order (respecting foreign keys)
    console.log('Inserting owners...');
    for (const owner of seedData.owners) {
      await duckDBManager.execute(
        `INSERT INTO owners (id, name, department, email, role) VALUES (?, ?, ?, ?, ?)`,
        [owner.id, owner.name, owner.department, owner.email, owner.role]
      );
    }
    
    console.log('Inserting assets...');
    for (const asset of seedData.assets) {
      await duckDBManager.execute(
        `INSERT INTO assets (id, device_name, status, owner_id, location, gpu_type, instance_count, network_bandwidth, created_date, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [asset.id, asset.device_name, asset.status, asset.owner_id, asset.location, asset.gpu_type, 
         asset.instance_count, asset.network_bandwidth, asset.created_date?.toISOString().split('T')[0], asset.notes]
      );
    }
    
    console.log('Inserting investigation signals...');
    for (const signal of seedData.investigationSignals) {
      await duckDBManager.execute(
        `INSERT INTO investigation_signals (signal_id, signal_name, severity, status, triggered_at, resolved_at, description, asset_id, assigned_to) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [signal.signal_id, signal.signal_name, signal.severity, signal.status, 
         signal.triggered_at?.toISOString() || null, signal.resolved_at?.toISOString() || null, 
         signal.description || null, signal.asset_id || null, signal.assigned_to || null]
      );
    }
    
    console.log('Inserting execution signals...');
    for (const signal of seedData.executionSignals) {
      await duckDBManager.execute(
        `INSERT INTO execution_signals (mdmid, status, triggered_at, signal_type, threshold_value, current_value, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [signal.mdmid, signal.status, signal.triggered_at?.toISOString() || null, 
         signal.signal_type || null, signal.threshold_value ?? null, signal.current_value ?? null, signal.description || null]
      );
    }
    
    console.log('Inserting datacenters...');
    for (const dc of seedData.datacenters) {
      await duckDBManager.execute(
        `INSERT INTO datacenters (datacenter_id, name, region, status, capacity_total, capacity_used, location, tier) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [dc.datacenter_id, dc.name, dc.region, dc.status, dc.capacity_total, dc.capacity_used, dc.location, dc.tier]
      );
    }
    
    console.log('Inserting stamps...');
    for (const stamp of seedData.stamps) {
      await duckDBManager.execute(
        `INSERT INTO stamps (stamp_id, stamp_name, datacenter_id, status, gpu_count, cpu_count, memory_gb, created_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [stamp.stamp_id, stamp.stamp_name, stamp.datacenter_id, stamp.status, 
         stamp.gpu_count, stamp.cpu_count, stamp.memory_gb, stamp.created_date?.toISOString().split('T')[0]]
      );
    }
    
    console.log('Inserting demand IDs...');
    for (const demand of seedData.demandIds) {
      await duckDBManager.execute(
        `INSERT INTO demand_ids (demand_id, customer, requested_gpus, priority, status, created_date, fulfilled_date, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [demand.demand_id, demand.customer, demand.requested_gpus, demand.priority, demand.status,
         demand.created_date?.toISOString().split('T')[0], demand.fulfilled_date?.toISOString().split('T')[0], demand.notes]
      );
    }
    
    console.log('Inserting universal supply...');
    for (const supply of seedData.universalSupply) {
      await duckDBManager.execute(
        `INSERT INTO universal_supply (supply_id, region, gpu_type, total_available, allocated, reserved, maintenance) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [supply.supply_id, supply.region, supply.gpu_type, supply.total_available, 
         supply.allocated, supply.reserved, supply.maintenance]
      );
    }
    
    console.log('Inserting dashboard metrics...');
    for (const metric of seedData.dashboardMetrics) {
      await duckDBManager.execute(
        `INSERT INTO dashboard_metrics (metric_id, metric_date, gpu_utilization, total_signals, active_investigations, stamps_online, demands_pending, supply_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [metric.metric_id, metric.metric_date.toISOString().split('T')[0], metric.gpu_utilization, 
         metric.total_signals, metric.active_investigations, metric.stamps_online, 
         metric.demands_pending, metric.supply_available]
      );
    }
    
    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}