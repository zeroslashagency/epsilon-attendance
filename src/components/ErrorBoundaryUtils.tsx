import React, { ReactNode } from 'react';
import { ErrorBoundary, Props } from './ErrorBoundary';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/utils/logger';

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specialized error boundaries for different parts of the app
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      // Could send to external error reporting service
      logger.error('Page Error Boundary triggered', { error, errorInfo }, 'PAGE_ERROR');
    }}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode;
  componentName?: string;
}> = ({ children, componentName }) => (
  <ErrorBoundary
    fallback={
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {componentName ? `${componentName} Error` : 'Component Error'}
          </span>
        </div>
        <p className="text-sm text-red-600 mt-1">
          This component encountered an error and couldn't render properly.
        </p>
      </div>
    }
    onError={(error, errorInfo) => {
      logger.error(`Component Error: ${componentName || 'Unknown'}`, { error, errorInfo }, 'COMPONENT_ERROR');
    }}
  >
    {children}
  </ErrorBoundary>
);
