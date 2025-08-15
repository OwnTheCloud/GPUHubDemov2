import { useState, useEffect, useCallback } from 'react';
import { sqljsManager as duckDBManager, initializeDB } from '@/db/sqljs-manager';
import { seedDatabase } from '@/db/seed-data';
import { queries } from '@/db/queries';
import { useToast } from '@/hooks/use-toast';

// Hook to initialize DuckDB
export function useDuckDBInit() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        console.log('Initializing database...');
        await initializeDB();
        
        // Wait a bit to ensure tables are created
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if tables are empty and seed if needed
        const tables = await duckDBManager.getTables();
        console.log('Available tables:', tables);
        
        if (tables.length === 0) {
          console.error('No tables created! Database initialization failed.');
          throw new Error('Database tables were not created');
        }
        
        // Check if we have data
        try {
          const assets = await queries.assets.getAll();
          if (assets.length === 0) {
            console.log('No data found, seeding database...');
            await seedDatabase();
            toast({
              title: "Database Initialized",
              description: "Sample data has been loaded successfully.",
            });
          }
        } catch (queryErr) {
          console.error('Query error, attempting to seed database:', queryErr);
          await seedDatabase();
        }
        
        if (mounted) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to initialize database:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize database');
          toast({
            title: "Database Error",
            description: "Failed to initialize database. Some features may not work properly.",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [toast]);

  return { isLoading, isInitialized, error };
}

// Generic hook for querying data
export function useDuckDBQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      console.error('Query error:', err);
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Hook for mutations (create, update, delete)
export function useDuckDBMutation<TArgs, TResult = void>(
  mutationFn: (args: TArgs) => Promise<TResult>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mutate = useCallback(async (args: TArgs, options?: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(args);
      
      if (options?.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }
      
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Operation failed';
      setError(errorMsg);
      
      toast({
        title: "Error",
        description: options?.errorMessage || errorMsg,
        variant: "destructive",
      });
      
      options?.onError?.(err instanceof Error ? err : new Error(errorMsg));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, toast]);

  return { mutate, loading, error };
}

// Specific hooks for each table

// Assets hooks
export function useAssets() {
  return useDuckDBQuery(() => queries.assets.getAll());
}

export function useAsset(id: string) {
  return useDuckDBQuery(() => queries.assets.getById(id), [id]);
}

export function useUpdateAsset() {
  return useDuckDBMutation((args: { id: string; updates: any }) => 
    queries.assets.update(args.id, args.updates)
  );
}

// Investigation Signals hooks
export function useInvestigationSignals() {
  return useDuckDBQuery(() => queries.investigationSignals.getAll());
}

export function useActiveInvestigationSignals() {
  return useDuckDBQuery(() => queries.investigationSignals.getActive());
}

export function useUpdateInvestigationSignal() {
  return useDuckDBMutation((args: { id: string; updates: any }) =>
    queries.investigationSignals.update(args.id, args.updates)
  );
}

// Execution Signals hooks
export function useExecutionSignals() {
  return useDuckDBQuery(() => queries.executionSignals.getWithDemands());
}

export function useUpdateExecutionSignal() {
  return useDuckDBMutation((args: { mdmid: string; updates: any }) =>
    queries.executionSignals.update(args.mdmid, args.updates)
  );
}

// Datacenters hooks
export function useDatacenters() {
  return useDuckDBQuery(() => queries.datacenters.getWithCapacity());
}

export function useUpdateDatacenter() {
  return useDuckDBMutation((args: { id: string; updates: any }) =>
    queries.datacenters.update(args.id, args.updates)
  );
}

// Stamps hooks
export function useStamps() {
  return useDuckDBQuery(() => queries.stamps.getAll());
}

export function useUpdateStamp() {
  return useDuckDBMutation((args: { id: string; updates: any }) =>
    queries.stamps.update(args.id, args.updates)
  );
}

// Demand IDs hooks
export function useDemandIDs() {
  return useDuckDBQuery(() => queries.demands.getAll());
}

export function usePendingDemands() {
  return useDuckDBQuery(() => queries.demands.getPending());
}

export function useUpdateDemand() {
  return useDuckDBMutation((args: { id: string; updates: any }) =>
    queries.demands.update(args.id, args.updates)
  );
}

export function useFulfillDemand() {
  return useDuckDBMutation((id: string) =>
    queries.demands.fulfill(id)
  );
}

// Universal Supply hooks
export function useUniversalSupply() {
  return useDuckDBQuery(() => queries.supply.getAvailableCapacity());
}

export function useUpdateSupply() {
  return useDuckDBMutation((args: { id: string; updates: any }) =>
    queries.supply.update(args.id, args.updates)
  );
}

// Dashboard hooks
export function useDashboardMetrics(days: number = 30) {
  return useDuckDBQuery(() => queries.dashboard.getMetrics(days), [days]);
}

export function useDashboardSummary() {
  return useDuckDBQuery(async () => {
    const [assets, signals, capacity] = await Promise.all([
      queries.aggregations.getAssetSummary(),
      queries.aggregations.getSignalSummary(),
      queries.aggregations.getCapacitySummary()
    ]);
    
    return {
      assets: assets[0],
      signals: signals[0],
      capacity: capacity[0]
    };
  });
}

// Export all hooks
export const duckDBHooks = {
  useInit: useDuckDBInit,
  useQuery: useDuckDBQuery,
  useMutation: useDuckDBMutation,
  
  // Table-specific hooks
  assets: {
    useAll: useAssets,
    useById: useAsset,
    useUpdate: useUpdateAsset,
  },
  investigationSignals: {
    useAll: useInvestigationSignals,
    useActive: useActiveInvestigationSignals,
    useUpdate: useUpdateInvestigationSignal,
  },
  executionSignals: {
    useAll: useExecutionSignals,
    useUpdate: useUpdateExecutionSignal,
  },
  datacenters: {
    useAll: useDatacenters,
    useUpdate: useUpdateDatacenter,
  },
  stamps: {
    useAll: useStamps,
    useUpdate: useUpdateStamp,
  },
  demands: {
    useAll: useDemandIDs,
    usePending: usePendingDemands,
    useUpdate: useUpdateDemand,
    useFulfill: useFulfillDemand,
  },
  supply: {
    useAll: useUniversalSupply,
    useUpdate: useUpdateSupply,
  },
  dashboard: {
    useMetrics: useDashboardMetrics,
    useSummary: useDashboardSummary,
  }
};