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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing database...</p>
        </div>
      </div>
    );
  }

  if (error && !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <svg
              className="h-6 w-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Database Initialization Failed</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              The application will continue with limited functionality.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DuckDBContext.Provider value={{ isInitialized, isLoading, error }}>
      {children}
    </DuckDBContext.Provider>
  );
}