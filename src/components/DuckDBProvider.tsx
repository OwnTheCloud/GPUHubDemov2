import React, { createContext, useContext, ReactNode } from 'react';
import { useDuckDBInit } from '@/hooks/use-duckdb';
import { Loader2 } from 'lucide-react';

interface DuckDBContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const DuckDBContext = createContext<DuckDBContextType>({
  isInitialized: false,
  isLoading: true,
  error: null,
});

export function useDuckDBContext() {
  return useContext(DuckDBContext);
}

interface DuckDBProviderProps {
  children: ReactNode;
}

export function DuckDBProvider({ children }: DuckDBProviderProps) {
  const { isLoading, isInitialized, error } = useDuckDBInit();

  // IMPORTANT: Never block rendering - initialize database in background
  // Individual components can check isLoading/isInitialized from context if they need data
  // This matches the Microsoft Power Platform sample pattern

  return (
    <DuckDBContext.Provider value={{ isInitialized, isLoading, error }}>
      {children}
    </DuckDBContext.Provider>
  );
}