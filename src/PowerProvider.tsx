import { initialize } from "@pa-client/power-code-sdk/lib/Lifecycle";
import { useEffect, ReactNode, useState } from "react";

interface PowerProviderProps {
    children: ReactNode;
}

export default function PowerProvider({ children }: PowerProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
        const initApp = async () => {
            try {
                // Add error handling for Power Platform specific issues
                if (typeof window !== 'undefined') {
                    // Suppress MutationObserver errors in Power Apps context
                    const originalConsoleError = console.error;
                    console.error = (...args) => {
                        const message = args[0]?.toString() || '';
                        if (message.includes('MutationObserver') || 
                            message.includes('web-client-content-script')) {
                            // Suppress Power Apps specific errors
                            return;
                        }
                        originalConsoleError.apply(console, args);
                    };
                }

                await initialize();
                console.log('Power Platform SDK initialized successfully');
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize Power Platform SDK:', error);
                setInitError(error instanceof Error ? error.message : 'Unknown error');
                // Continue anyway - app should work even if Power Platform SDK fails
                setIsInitialized(true);
            }
        };
        
        initApp();
    }, []);

    // Show loading state while initializing
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Initializing...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}