import { useState, useEffect } from 'react';
import { isPowerPlatform } from '@/lib/environment';

// Minimal loading component that renders immediately
function MinimalLoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Starting application...</p>
      </div>
    </div>
  );
}

interface PowerPlatformAppProps {
  children: React.ReactNode;
}

export function PowerPlatformApp({ children }: PowerPlatformAppProps) {
  const [isReady, setIsReady] = useState(false);
  const [isPowerPlatformEnv, setIsPowerPlatformEnv] = useState(false);

  useEffect(() => {
    // Setup environment detection AFTER mounting
    const setupEnvironment = async () => {
      try {
        // Power Platform specific error suppression (MutationObserver already handled in index.html)
        if (typeof window !== 'undefined') {
          const originalError = console.error;
          console.error = (...args) => {
            const message = args[0]?.toString() || '';
            if (message.includes('Cannot destructure property') || 
                message.includes('basename')) {
              return; // Suppress Power Platform router errors
            }
            originalError.apply(console, args);
          };
        }

        // Detect environment
        const isPlatform = isPowerPlatform();
        setIsPowerPlatformEnv(isPlatform);
        
        console.log(`Environment detected: ${isPlatform ? 'Power Platform' : 'Standard Web'}`);
        
        setIsReady(true);
      } catch (error) {
        console.warn('Environment setup failed, continuing anyway:', error);
        setIsReady(true);
      }
    };

    setupEnvironment();
  }, []);

  // Show minimal loading until environment is ready
  if (!isReady) {
    return <MinimalLoadingScreen />;
  }

  return <>{children}</>;
}

export default PowerPlatformApp;