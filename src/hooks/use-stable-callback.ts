import { useCallback, useRef } from 'react';

/**
 * Creates a stable callback that doesn't change between renders
 * but always calls the latest version of the provided function.
 * Useful for preventing unnecessary re-renders in child components.
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
}

/**
 * Similar to useStableCallback but with dependency array support
 */
export function useStableCallbackWithDeps<T extends (...args: any[]) => any>(
  callback: T, 
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  return useCallback(((...args) => callbackRef.current(...args)) as T, deps);
}