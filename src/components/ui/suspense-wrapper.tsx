import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { DataTableSkeleton, PageSkeleton, CardGridSkeleton, ChartSkeleton } from '@/components/ui/data-table-skeleton';

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  type?: 'page' | 'table' | 'cards' | 'chart' | 'custom';
}

const getFallbackComponent = (type: SuspenseWrapperProps['type']) => {
  switch (type) {
    case 'page':
      return <PageSkeleton />;
    case 'table':
      return <DataTableSkeleton />;
    case 'cards':
      return <CardGridSkeleton />;
    case 'chart':
      return <ChartSkeleton />;
    default:
      return <DataTableSkeleton />;
  }
};

export function SuspenseWrapper({ 
  children, 
  fallback, 
  errorFallback, 
  type = 'table' 
}: SuspenseWrapperProps) {
  const defaultFallback = fallback || getFallbackComponent(type);

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Higher-order component for easier usage
export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<SuspenseWrapperProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <SuspenseWrapper {...options}>
      <Component {...props} />
    </SuspenseWrapper>
  );

  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return WrappedComponent;
}