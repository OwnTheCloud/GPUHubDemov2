import React, { createContext, useContext, useEffect, useState } from 'react';

interface PowerContextType {
  isInitialized: boolean;
  error: string | null;
  isLoading: boolean;
}

const PowerContext = createContext<PowerContextType>({
  isInitialized: false,
  error: null,
  isLoading: true,
});

export const usePower = () => useContext(PowerContext);

interface PowerProviderProps {
  children: React.ReactNode;
}

export default function PowerProvider({ children }: PowerProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePowerPlatform = async () => {
      try {
        // Check if we're running in Power Platform environment
        const isPowerPlatform = typeof window !== 'undefined' && 
          (window.location.hostname.includes('powerapps.com') ||
           window.location.hostname.includes('powerplatformusercontent.com') ||
           window.location.hostname.includes('powerpages.microsoft.com'));

        if (isPowerPlatform) {
          // Only initialize SDK if in Power Platform environment
          const { initialize } = await import('@microsoft/power-apps/app');
          await initialize();
          console.log('Power Platform SDK initialized successfully');
        } else {
          console.log('Running in local development mode - skipping Power Platform SDK initialization');
        }
        
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Power Platform initialization failed:', errorMessage);
        setError(errorMessage);
        
        // In case of SDK error, still allow app to run
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializePowerPlatform();
  }, []);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing Power Platform...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error && !isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="text-destructive text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold">Initialization Error</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const contextValue: PowerContextType = {
    isInitialized,
    error,
    isLoading,
  };

  return (
    <PowerContext.Provider value={contextValue}>
      {children}
    </PowerContext.Provider>
  );
}