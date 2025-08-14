import { datacentersData, type Datacenter } from '@/data/datacenters-data';
import { executionSignalsData, type ExecutionSignal } from '@/data/execution-signals-data';
import { investigationSignalsData, type InvestigationSignal } from '@/data/investigation-signals-data';

export interface DatacenterFilters {
  region?: string;
  status?: Datacenter['status'];
  minGPUs?: number;
  type?: Datacenter['type'];
  utilizationThreshold?: number;
}

export interface SignalFilters {
  severity?: InvestigationSignal['severity'];
  status?: string;
  datacenter?: string;
  gpuType?: string;
}

export interface DatacenterStats {
  totalGPUs: number;
  totalCapacity: number;
  totalPowerUsage: number;
  averageUtilization: number;
  datacentersByGPUs: Datacenter[];
  powerByDatacenter: { name: string; power: number }[];
  utilizationByDatacenter: { name: string; utilization: number }[];
  onlineDatacenters: number;
  totalDatacenters: number;
}

export class DataService {
  private static instance: DataService;
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Datacenter queries
  async queryDatacenters(filters?: DatacenterFilters): Promise<Datacenter[]> {
    let results = [...datacentersData];
    
    if (filters) {
      if (filters.region) {
        results = results.filter(dc => dc.region === filters.region);
      }
      if (filters.status) {
        results = results.filter(dc => dc.status === filters.status);
      }
      if (filters.type) {
        results = results.filter(dc => dc.type === filters.type);
      }
      if (filters.minGPUs) {
        results = results.filter(dc => dc.deployedGPUs >= filters.minGPUs);
      }
      if (filters.utilizationThreshold) {
        results = results.filter(dc => 
          parseFloat(dc.utilization.replace('%', '')) < filters.utilizationThreshold
        );
      }
    }
    
    return results;
  }

  async getDatacenterStats(): Promise<DatacenterStats> {
    const datacenters = datacentersData;
    
    const totalGPUs = datacenters.reduce((sum, dc) => sum + dc.deployedGPUs, 0);
    const totalCapacity = datacenters.reduce((sum, dc) => sum + dc.gpuCapacity, 0);
    
    // Parse power usage (remove "MW" and convert to number)
    const totalPowerUsage = datacenters.reduce((sum, dc) => {
      const powerValue = parseFloat(dc.powerUsage.replace(' MW', ''));
      return sum + powerValue;
    }, 0);

    // Calculate average utilization
    const utilizationSum = datacenters.reduce((sum, dc) => {
      const utilizationValue = parseFloat(dc.utilization.replace('%', ''));
      return sum + utilizationValue;
    }, 0);
    const averageUtilization = utilizationSum / datacenters.length;

    // Sort datacenters by GPU count
    const datacentersByGPUs = [...datacenters].sort((a, b) => b.deployedGPUs - a.deployedGPUs);

    // Power breakdown by datacenter
    const powerByDatacenter = datacenters.map(dc => ({
      name: dc.name,
      power: parseFloat(dc.powerUsage.replace(' MW', ''))
    }));

    // Utilization breakdown by datacenter
    const utilizationByDatacenter = datacenters.map(dc => ({
      name: dc.name,
      utilization: parseFloat(dc.utilization.replace('%', ''))
    }));

    const onlineDatacenters = datacenters.filter(dc => dc.status === 'Online').length;

    return {
      totalGPUs,
      totalCapacity,
      totalPowerUsage,
      averageUtilization,
      datacentersByGPUs,
      powerByDatacenter,
      utilizationByDatacenter,
      onlineDatacenters,
      totalDatacenters: datacenters.length
    };
  }

  async getDatacenterWithMostGPUs(): Promise<{
    datacenter: Datacenter;
    stats: { totalCapacity: number; utilization: number; powerUsage: number };
  }> {
    const stats = await this.getDatacenterStats();
    const topDC = stats.datacentersByGPUs[0];
    
    return {
      datacenter: topDC,
      stats: {
        totalCapacity: topDC.gpuCapacity,
        utilization: parseFloat(topDC.utilization.replace('%', '')),
        powerUsage: parseFloat(topDC.powerUsage.replace(' MW', ''))
      }
    };
  }

  async findUnderutilizedResources(utilizationThreshold: number = 50): Promise<{
    datacenters: Datacenter[];
    totalUnderutilizedGPUs: number;
    totalWastedCapacity: number;
    recommendations: string[];
  }> {
    const underutilized = datacentersData.filter(dc => {
      const utilization = parseFloat(dc.utilization.replace('%', ''));
      return utilization < utilizationThreshold && dc.status === 'Online';
    });

    const totalUnderutilizedGPUs = underutilized.reduce((sum, dc) => {
      const currentUtilization = parseFloat(dc.utilization.replace('%', '')) / 100;
      const underutilizedGPUs = Math.floor(dc.deployedGPUs * (1 - currentUtilization));
      return sum + underutilizedGPUs;
    }, 0);

    const totalWastedCapacity = underutilized.reduce((sum, dc) => {
      const utilization = parseFloat(dc.utilization.replace('%', ''));
      return sum + (dc.gpuCapacity - dc.deployedGPUs);
    }, 0);

    const recommendations = [
      `${underutilized.length} datacenters have utilization below ${utilizationThreshold}%`,
      `Consider consolidating workloads to improve efficiency`,
      `${totalWastedCapacity} GPUs are available for deployment`,
      underutilized.length > 2 ? 'Multiple sites available for workload migration' : 'Limited sites for workload optimization'
    ];

    return {
      datacenters: underutilized,
      totalUnderutilizedGPUs,
      totalWastedCapacity,
      recommendations
    };
  }

  // Signal queries
  async queryExecutionSignals(filters?: SignalFilters): Promise<ExecutionSignal[]> {
    let results = [...executionSignalsData];
    
    if (filters) {
      if (filters.status) {
        results = results.filter(signal => signal.status === filters.status);
      }
      if (filters.datacenter) {
        results = results.filter(signal => signal.datacenter === filters.datacenter);
      }
      if (filters.gpuType) {
        results = results.filter(signal => signal.gpuType === filters.gpuType);
      }
    }
    
    return results;
  }

  async queryInvestigationSignals(filters?: SignalFilters): Promise<InvestigationSignal[]> {
    let results = [...investigationSignalsData];
    
    if (filters) {
      if (filters.severity) {
        results = results.filter(signal => signal.severity === filters.severity);
      }
      if (filters.status) {
        results = results.filter(signal => signal.status === filters.status);
      }
      if (filters.datacenter) {
        results = results.filter(signal => signal.datacenter === filters.datacenter);
      }
      if (filters.gpuType) {
        results = results.filter(signal => signal.gpuType === filters.gpuType);
      }
    }
    
    return results;
  }

  async getSignalStats(): Promise<{
    totalInvestigationSignals: number;
    totalExecutionSignals: number;
    criticalInvestigationSignals: number;
    runningExecutionSignals: number;
    affectedGPUs: number;
  }> {
    const investigationSignals = investigationSignalsData;
    const executionSignals = executionSignalsData;

    const criticalInvestigationSignals = investigationSignals.filter(
      signal => signal.severity === 'Critical'
    ).length;

    const runningExecutionSignals = executionSignals.filter(
      signal => signal.status === 'Running'
    ).length;

    const affectedGPUs = investigationSignals.reduce((sum, signal) => sum + signal.affectedGPUs, 0);

    return {
      totalInvestigationSignals: investigationSignals.length,
      totalExecutionSignals: executionSignals.length,
      criticalInvestigationSignals,
      runningExecutionSignals,
      affectedGPUs
    };
  }

  // Helper methods for parsing data
  parseUtilization(utilization: string): number {
    return parseFloat(utilization.replace('%', ''));
  }

  parsePowerUsage(powerUsage: string): number {
    return parseFloat(powerUsage.replace(' MW', ''));
  }

  // Get all data for context
  async getAllData() {
    const [datacenters, executionSignals, investigationSignals, stats, signalStats] = await Promise.all([
      this.queryDatacenters(),
      this.queryExecutionSignals(),
      this.queryInvestigationSignals(),
      this.getDatacenterStats(),
      this.getSignalStats()
    ]);

    return {
      datacenters,
      executionSignals,
      investigationSignals,
      stats,
      signalStats,
      summary: {
        totalDatacenters: datacenters.length,
        totalGPUs: stats.totalGPUs,
        totalPower: stats.totalPowerUsage,
        averageUtilization: Math.round(stats.averageUtilization * 10) / 10,
        criticalIssues: signalStats.criticalInvestigationSignals,
        affectedGPUs: signalStats.affectedGPUs
      }
    };
  }
}