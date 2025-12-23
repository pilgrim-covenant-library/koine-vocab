/**
 * Error Tracking and Monitoring System
 *
 * Provides centralized error tracking, performance monitoring,
 * and analytics for production environments.
 *
 * Integration: Can be connected to Sentry, LogRocket, or other services
 * Current: Uses console logging with structured formatting
 */

import { isFeatureEnabled } from './featureFlags';

// =============================================================================
// Types
// =============================================================================

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface ErrorContext {
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface FirebaseMetric {
  operation: 'read' | 'write' | 'delete';
  collection: string;
  success: boolean;
  duration?: number;
  error?: string;
}

// =============================================================================
// Configuration
// =============================================================================

interface ErrorTrackingConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  sampleRate: number; // 0.0 to 1.0
  enablePerformanceMonitoring: boolean;
  enableFirebaseMetrics: boolean;
  enableConsoleLogging: boolean;
}

const DEFAULT_CONFIG: ErrorTrackingConfig = {
  enabled: true,
  environment: (process.env.NODE_ENV as any) || 'development',
  sampleRate: 1.0, // Track 100% in dev, reduce in production
  enablePerformanceMonitoring: true,
  enableFirebaseMetrics: true,
  enableConsoleLogging: process.env.NODE_ENV !== 'production',
};

let config = { ...DEFAULT_CONFIG };

/**
 * Initialize error tracking
 *
 * @param options - Configuration options
 */
export function initErrorTracking(options: Partial<ErrorTrackingConfig> = {}): void {
  config = { ...DEFAULT_CONFIG, ...options };

  if (config.enableConsoleLogging) {
    console.log('🔍 Error tracking initialized:', {
      environment: config.environment,
      sampleRate: config.sampleRate,
      performanceMonitoring: config.enablePerformanceMonitoring,
      firebaseMetrics: config.enableFirebaseMetrics,
    });
  }

  // Set up global error handlers
  if (typeof window !== 'undefined') {
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  }
}

/**
 * Cleanup error tracking
 */
export function cleanupErrorTracking(): void {
  if (typeof window !== 'undefined') {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }

  // Clear all metrics arrays
  performanceMetrics.length = 0;
  firebaseMetrics.length = 0;
  sessionStorage.removeItem('recent_errors');
}

// =============================================================================
// Error Tracking
// =============================================================================

/**
 * Track an error with context
 *
 * @param error - Error object or message
 * @param severity - Error severity level
 * @param context - Additional context
 */
export function trackError(
  error: Error | string,
  severity: ErrorSeverity = 'error',
  context?: ErrorContext
): void {
  if (!config.enabled || !shouldSample()) {
    return;
  }

  const errorData = {
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    severity,
    timestamp: Date.now(),
    environment: config.environment,
    context,
  };

  // Console logging
  if (config.enableConsoleLogging) {
    const emoji = getSeverityEmoji(severity);
    console.group(`${emoji} ${severity.toUpperCase()}: ${errorData.message}`);
    if (errorData.stack) {
      console.error(errorData.stack);
    }
    if (context) {
      console.log('Context:', context);
    }
    console.groupEnd();
  }

  // TODO: Send to Sentry/LogRocket
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     level: severity,
  //     contexts: { custom: context },
  //   });
  // }

  // Store recent errors in sessionStorage for debugging
  storeRecentError(errorData);
}

/**
 * Track a warning
 *
 * @param message - Warning message
 * @param context - Additional context
 */
export function trackWarning(message: string, context?: ErrorContext): void {
  trackError(message, 'warning', context);
}

/**
 * Track an info message
 *
 * @param message - Info message
 * @param context - Additional context
 */
export function trackInfo(message: string, context?: ErrorContext): void {
  trackError(message, 'info', context);
}

/**
 * Handle global uncaught errors
 */
function handleGlobalError(event: ErrorEvent): void {
  trackError(event.error || event.message, 'error', {
    component: 'Global',
    metadata: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
  });
}

/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  trackError(
    event.reason instanceof Error ? event.reason : String(event.reason),
    'error',
    {
      component: 'Promise',
      metadata: {
        type: 'unhandledRejection',
      },
    }
  );
}

// =============================================================================
// Performance Monitoring
// =============================================================================

const performanceMetrics: PerformanceMetric[] = [];

/**
 * Track a performance metric
 *
 * @param metric - Performance metric data
 */
export function trackPerformance(metric: PerformanceMetric): void {
  if (!config.enabled || !config.enablePerformanceMonitoring || !shouldSample()) {
    return;
  }

  performanceMetrics.push(metric);

  if (config.enableConsoleLogging) {
    console.log(`⏱️ Performance: ${metric.name} took ${metric.duration.toFixed(2)}ms`);
  }

  // Keep only last 100 metrics
  if (performanceMetrics.length > 100) {
    performanceMetrics.shift();
  }

  // TODO: Send to analytics service
}

/**
 * Measure the duration of an async operation
 *
 * @param name - Metric name
 * @param operation - Async operation to measure
 * @param metadata - Additional metadata
 * @returns Result of operation
 */
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    trackPerformance({ name, duration, metadata });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    trackPerformance({
      name: `${name} (failed)`,
      duration,
      metadata: { ...metadata, error: true },
    });

    throw error;
  }
}

/**
 * Measure the duration of a sync operation
 *
 * @param name - Metric name
 * @param operation - Sync operation to measure
 * @param metadata - Additional metadata
 * @returns Result of operation
 */
export function measureSync<T>(
  name: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  const startTime = performance.now();

  try {
    const result = operation();
    const duration = performance.now() - startTime;

    trackPerformance({ name, duration, metadata });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    trackPerformance({
      name: `${name} (failed)`,
      duration,
      metadata: { ...metadata, error: true },
    });

    throw error;
  }
}

/**
 * Get performance metrics summary
 */
export function getPerformanceMetrics(): {
  metrics: PerformanceMetric[];
  summary: Record<string, { count: number; avg: number; min: number; max: number }>;
} {
  const summary: Record<string, { count: number; avg: number; min: number; max: number }> = {};

  performanceMetrics.forEach((metric) => {
    if (!summary[metric.name]) {
      summary[metric.name] = {
        count: 0,
        avg: 0,
        min: Infinity,
        max: -Infinity,
      };
    }

    const s = summary[metric.name];
    s.count++;
    s.min = Math.min(s.min, metric.duration);
    s.max = Math.max(s.max, metric.duration);
    s.avg = (s.avg * (s.count - 1) + metric.duration) / s.count;
  });

  return { metrics: performanceMetrics, summary };
}

// =============================================================================
// Firebase Metrics
// =============================================================================

const firebaseMetrics: FirebaseMetric[] = [];

/**
 * Track a Firebase operation
 *
 * @param metric - Firebase operation metric
 */
export function trackFirebaseOperation(metric: FirebaseMetric): void {
  if (!config.enabled || !config.enableFirebaseMetrics || !shouldSample()) {
    return;
  }

  firebaseMetrics.push(metric);

  if (config.enableConsoleLogging) {
    const emoji = metric.success ? '✅' : '❌';
    const duration = metric.duration ? ` (${metric.duration.toFixed(2)}ms)` : '';
    console.log(
      `${emoji} Firebase ${metric.operation} ${metric.collection}${duration}`
    );
    if (metric.error) {
      console.error(`  Error: ${metric.error}`);
    }
  }

  // Keep only last 100 metrics
  if (firebaseMetrics.length > 100) {
    firebaseMetrics.shift();
  }
}

/**
 * Get Firebase metrics summary
 */
export function getFirebaseMetrics(): {
  metrics: FirebaseMetric[];
  summary: {
    totalOperations: number;
    reads: number;
    writes: number;
    deletes: number;
    successRate: number;
    avgDuration: number;
  };
} {
  const summary = {
    totalOperations: firebaseMetrics.length,
    reads: 0,
    writes: 0,
    deletes: 0,
    successRate: 0,
    avgDuration: 0,
  };

  let totalDuration = 0;
  let durationCount = 0;
  let successCount = 0;

  firebaseMetrics.forEach((metric) => {
    switch (metric.operation) {
      case 'read':
        summary.reads++;
        break;
      case 'write':
        summary.writes++;
        break;
      case 'delete':
        summary.deletes++;
        break;
    }

    if (metric.success) {
      successCount++;
    }

    if (metric.duration !== undefined) {
      totalDuration += metric.duration;
      durationCount++;
    }
  });

  summary.successRate = summary.totalOperations > 0
    ? (successCount / summary.totalOperations) * 100
    : 0;
  summary.avgDuration = durationCount > 0 ? totalDuration / durationCount : 0;

  return { metrics: firebaseMetrics, summary };
}

// =============================================================================
// User Context
// =============================================================================

let userContext: { userId?: string; email?: string } = {};

/**
 * Set user context for error tracking
 *
 * @param userId - User ID
 * @param email - User email (optional)
 */
export function setUserContext(userId: string, email?: string): void {
  userContext = { userId, email };

  if (config.enableConsoleLogging) {
    console.log('👤 User context set:', userContext);
  }

  // TODO: Set in Sentry
  // if (window.Sentry) {
  //   window.Sentry.setUser({ id: userId, email });
  // }
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  userContext = {};

  if (config.enableConsoleLogging) {
    console.log('👤 User context cleared');
  }

  // TODO: Clear in Sentry
  // if (window.Sentry) {
  //   window.Sentry.setUser(null);
  // }
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Check if this event should be sampled
 */
function shouldSample(): boolean {
  return Math.random() < config.sampleRate;
}

/**
 * Get emoji for severity level
 */
function getSeverityEmoji(severity: ErrorSeverity): string {
  switch (severity) {
    case 'fatal':
      return '💀';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    case 'debug':
      return '🔍';
  }
}

/**
 * Store recent errors in sessionStorage
 */
function storeRecentError(errorData: any): void {
  try {
    const key = 'recent_errors';
    const stored = sessionStorage.getItem(key);
    const errors = stored ? JSON.parse(stored) : [];

    errors.push(errorData);

    // Keep only last 10 errors
    if (errors.length > 10) {
      errors.shift();
    }

    sessionStorage.setItem(key, JSON.stringify(errors));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get recent errors from sessionStorage
 */
export function getRecentErrors(): any[] {
  try {
    const stored = sessionStorage.getItem('recent_errors');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Export all tracking data for debugging
 */
export function exportTrackingData(): {
  errors: any[];
  performance: ReturnType<typeof getPerformanceMetrics>;
  firebase: ReturnType<typeof getFirebaseMetrics>;
  config: ErrorTrackingConfig;
} {
  return {
    errors: getRecentErrors(),
    performance: getPerformanceMetrics(),
    firebase: getFirebaseMetrics(),
    config,
  };
}
