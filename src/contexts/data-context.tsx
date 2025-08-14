import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DataService } from '@/services/data-service';
import type { Datacenter } from '@/data/datacenters-data';
import type { ExecutionSignal } from '@/data/execution-signals-data';
import type { InvestigationSignal } from '@/data/investigation-signals-data';

interface DataContextType {
  // Data state
  datacenters: Datacenter[];
  executionSignals: ExecutionSignal[];
  investigationSignals: InvestigationSignal[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  refreshData: () => Promise<void>;
  
  // Stats (cached for performance)
  stats: {
    totalGPUs: number;
    totalDatacenters: number;
    totalPowerUsage: number;
    averageUtilization: number;
    onlineDatacenters: number;
    criticalIssues: number;
  } | null;
}

const DataContext = createContext<DataContextType | null>(null);

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [datacenters, setDatacenters] = useState<Datacenter[]>([]);
  const [executionSignals, setExecutionSignals] = useState<ExecutionSignal[]>([]);
  const [investigationSignals, setInvestigationSignals] = useState<InvestigationSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DataContextType['stats']>(null);

  const dataService = DataService.getInstance();

  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [
        datacentersData,
        executionSignalsData,
        investigationSignalsData,
        datacenterStats,
        signalStats
      ] = await Promise.all([
        dataService.queryDatacenters(),
        dataService.queryExecutionSignals(),
        dataService.queryInvestigationSignals(),
        dataService.getDatacenterStats(),
        dataService.getSignalStats()
      ]);

      // Update state
      setDatacenters(datacentersData);
      setExecutionSignals(executionSignalsData);
      setInvestigationSignals(investigationSignalsData);
      
      // Calculate and cache stats
      setStats({
        totalGPUs: datacenterStats.totalGPUs,
        totalDatacenters: datacenterStats.totalDatacenters,
        totalPowerUsage: datacenterStats.totalPowerUsage,
        averageUtilization: Math.round(datacenterStats.averageUtilization * 10) / 10,
        onlineDatacenters: datacenterStats.onlineDatacenters,
        criticalIssues: signalStats.criticalInvestigationSignals,
      });

    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Optional: Set up periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value: DataContextType = {
    datacenters,
    executionSignals,
    investigationSignals,
    isLoading,
    refreshData,
    stats,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Hook for easy access to specific data types
export function useDatacenters() {
  const { datacenters, isLoading } = useDataContext();
  return { datacenters, isLoading };
}

export function useSignals() {
  const { executionSignals, investigationSignals, isLoading } = useDataContext();
  return { executionSignals, investigationSignals, isLoading };
}

export function useDataStats() {
  const { stats, isLoading } = useDataContext();
  return { stats, isLoading };
}