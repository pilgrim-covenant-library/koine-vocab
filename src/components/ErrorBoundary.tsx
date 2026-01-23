'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardContent className="py-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">
                An unexpected error occurred. Your progress has been saved.
              </p>
              {this.state.error && (
                <details className="mb-4 text-left" open>
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error details
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

/**
 * Smaller inline error fallback for less critical errors in sections
 */
export function InlineError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>{message || 'Unable to load this content.'}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Section-level error boundary for wrapping feature sections
 * Shows a more compact error message that doesn't take over the whole screen
 */
export class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; sectionName?: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; sectionName?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.sectionName || 'section'}:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="font-medium text-foreground">
                    {this.props.sectionName ? `${this.props.sectionName} ` : ''}Error
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This section encountered a problem loading.
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
