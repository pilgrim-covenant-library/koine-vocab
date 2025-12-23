/**
 * Tests for Error Tracking and Monitoring System
 *
 * Tests error tracking, performance monitoring,
 * Firebase metrics, and user context management.
 */

import {
  initErrorTracking,
  cleanupErrorTracking,
  trackError,
  trackWarning,
  trackInfo,
  trackPerformance,
  measureAsync,
  measureSync,
  getPerformanceMetrics,
  trackFirebaseOperation,
  getFirebaseMetrics,
  setUserContext,
  clearUserContext,
  getRecentErrors,
  exportTrackingData,
  type ErrorSeverity,
} from '@/lib/errorTracking';

describe('Error Tracking', () => {
  beforeEach(() => {
    // Initialize with test config
    initErrorTracking({
      enabled: true,
      environment: 'development',
      sampleRate: 1.0,
      enableConsoleLogging: false, // Disable console logs in tests
      enablePerformanceMonitoring: true,
      enableFirebaseMetrics: true,
    });

    sessionStorage.clear();
  });

  afterEach(() => {
    cleanupErrorTracking();
  });

  describe('initErrorTracking', () => {
    it('should initialize with default config', () => {
      initErrorTracking();

      const data = exportTrackingData();
      expect(data.config).toBeDefined();
      expect(data.config.enabled).toBe(true);
    });

    it('should accept custom config', () => {
      initErrorTracking({
        enabled: false,
        sampleRate: 0.5,
      });

      const data = exportTrackingData();
      expect(data.config.enabled).toBe(false);
      expect(data.config.sampleRate).toBe(0.5);
    });

    it('should set up global error handlers', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      initErrorTracking();

      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });
  });

  describe('cleanupErrorTracking', () => {
    it('should remove global error handlers', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      initErrorTracking();
      cleanupErrorTracking();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('trackError', () => {
    it('should track error with message', () => {
      trackError('Test error message');

      const errors = getRecentErrors();
      expect(errors.length).toBeGreaterThan(0);

      const lastError = errors[errors.length - 1];
      expect(lastError.message).toBe('Test error message');
      expect(lastError.severity).toBe('error');
    });

    it('should track Error object', () => {
      const error = new Error('Test error object');
      trackError(error);

      const errors = getRecentErrors();
      const lastError = errors[errors.length - 1];

      expect(lastError.message).toBe('Test error object');
      expect(lastError.stack).toBeDefined();
    });

    it('should track with custom severity', () => {
      trackError('Fatal error', 'fatal');

      const errors = getRecentErrors();
      const lastError = errors[errors.length - 1];

      expect(lastError.severity).toBe('fatal');
    });

    it('should track with context', () => {
      const context = {
        userId: 'user_123',
        component: 'FlashcardPage',
        action: 'submitReview',
        metadata: { wordId: 'word_1', quality: 4 },
      };

      trackError('Review submission failed', 'error', context);

      const errors = getRecentErrors();
      const lastError = errors[errors.length - 1];

      expect(lastError.context).toEqual(context);
    });

    it('should store timestamp', () => {
      const before = Date.now();
      trackError('Test error');
      const after = Date.now();

      const errors = getRecentErrors();
      const lastError = errors[errors.length - 1];

      expect(lastError.timestamp).toBeGreaterThanOrEqual(before);
      expect(lastError.timestamp).toBeLessThanOrEqual(after);
    });

    it('should respect sample rate', () => {
      initErrorTracking({
        enabled: true,
        sampleRate: 0.0, // Never sample
        enableConsoleLogging: false,
      });

      trackError('Should not be tracked');

      const errors = getRecentErrors();
      expect(errors).toHaveLength(0);
    });

    it('should limit stored errors to 10', () => {
      // Track 15 errors
      for (let i = 0; i < 15; i++) {
        trackError(`Error ${i}`);
      }

      const errors = getRecentErrors();
      expect(errors.length).toBeLessThanOrEqual(10);

      // Should keep most recent
      const lastError = errors[errors.length - 1];
      expect(lastError.message).toBe('Error 14');
    });
  });

  describe('trackWarning and trackInfo', () => {
    it('should track warning with correct severity', () => {
      trackWarning('Test warning');

      const errors = getRecentErrors();
      const lastError = errors[errors.length - 1];

      expect(lastError.message).toBe('Test warning');
      expect(lastError.severity).toBe('warning');
    });

    it('should track info with correct severity', () => {
      trackInfo('Test info');

      const errors = getRecentErrors();
      const lastError = errors[errors.length - 1];

      expect(lastError.message).toBe('Test info');
      expect(lastError.severity).toBe('info');
    });
  });

  describe('Performance Monitoring', () => {
    describe('trackPerformance', () => {
      it('should track performance metric', () => {
        trackPerformance({
          name: 'test-operation',
          duration: 123.45,
        });

        const { metrics } = getPerformanceMetrics();
        expect(metrics.length).toBeGreaterThan(0);

        const lastMetric = metrics[metrics.length - 1];
        expect(lastMetric.name).toBe('test-operation');
        expect(lastMetric.duration).toBe(123.45);
      });

      it('should track with metadata', () => {
        trackPerformance({
          name: 'firebase-sync',
          duration: 456.78,
          metadata: { collection: 'progress', operation: 'write' },
        });

        const { metrics } = getPerformanceMetrics();
        const lastMetric = metrics[metrics.length - 1];

        expect(lastMetric.metadata).toEqual({
          collection: 'progress',
          operation: 'write',
        });
      });

      it('should limit metrics to 100', () => {
        // Track 150 metrics
        for (let i = 0; i < 150; i++) {
          trackPerformance({ name: `metric-${i}`, duration: i });
        }

        const { metrics } = getPerformanceMetrics();
        expect(metrics.length).toBeLessThanOrEqual(100);
      });
    });

    describe('measureAsync', () => {
      it('should measure async operation duration', async () => {
        const operation = async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return 'result';
        };

        const result = await measureAsync('test-async', operation);

        expect(result).toBe('result');

        const { metrics } = getPerformanceMetrics();
        const metric = metrics.find((m) => m.name === 'test-async');

        expect(metric).toBeDefined();
        if (metric) {
          expect(metric.duration).toBeGreaterThanOrEqual(90); // Account for timing variance
          expect(metric.duration).toBeLessThan(200);
        }
      });

      it('should track failed operations', async () => {
        const operation = async () => {
          throw new Error('Operation failed');
        };

        await expect(measureAsync('test-failed', operation)).rejects.toThrow(
          'Operation failed'
        );

        const { metrics } = getPerformanceMetrics();
        const metric = metrics.find((m) => m.name === 'test-failed (failed)');

        expect(metric).toBeDefined();
        if (metric) {
          expect(metric.metadata?.error).toBe(true);
        }
      });

      it('should include metadata', async () => {
        const operation = async () => 'done';

        await measureAsync('test-with-meta', operation, { userId: 'user_1' });

        const { metrics } = getPerformanceMetrics();
        const metric = metrics.find((m) => m.name === 'test-with-meta');

        expect(metric?.metadata?.userId).toBe('user_1');
      });
    });

    describe('measureSync', () => {
      it('should measure sync operation duration', () => {
        const operation = () => {
          // Simulate some work
          let sum = 0;
          for (let i = 0; i < 1000000; i++) {
            sum += i;
          }
          return sum;
        };

        const result = measureSync('test-sync', operation);

        expect(typeof result).toBe('number');

        const { metrics } = getPerformanceMetrics();
        const metric = metrics.find((m) => m.name === 'test-sync');

        expect(metric).toBeDefined();
        if (metric) {
          expect(metric.duration).toBeGreaterThan(0);
        }
      });

      it('should track failed sync operations', () => {
        const operation = () => {
          throw new Error('Sync operation failed');
        };

        expect(() => measureSync('test-sync-failed', operation)).toThrow(
          'Sync operation failed'
        );

        const { metrics } = getPerformanceMetrics();
        const metric = metrics.find((m) => m.name === 'test-sync-failed (failed)');

        expect(metric).toBeDefined();
        if (metric) {
          expect(metric.metadata?.error).toBe(true);
        }
      });
    });

    describe('getPerformanceMetrics', () => {
      it('should return metrics and summary', () => {
        trackPerformance({ name: 'op-1', duration: 100 });
        trackPerformance({ name: 'op-1', duration: 200 });
        trackPerformance({ name: 'op-1', duration: 150 });
        trackPerformance({ name: 'op-2', duration: 50 });

        const { metrics, summary } = getPerformanceMetrics();

        expect(metrics.length).toBe(4);
        expect(summary['op-1']).toBeDefined();
        expect(summary['op-2']).toBeDefined();

        const op1Summary = summary['op-1'];
        expect(op1Summary.count).toBe(3);
        expect(op1Summary.min).toBe(100);
        expect(op1Summary.max).toBe(200);
        expect(op1Summary.avg).toBe(150);
      });

      it('should calculate correct averages', () => {
        trackPerformance({ name: 'test', duration: 10 });
        trackPerformance({ name: 'test', duration: 20 });
        trackPerformance({ name: 'test', duration: 30 });

        const { summary } = getPerformanceMetrics();

        expect(summary['test'].avg).toBe(20);
      });
    });
  });

  describe('Firebase Metrics', () => {
    describe('trackFirebaseOperation', () => {
      it('should track successful operation', () => {
        trackFirebaseOperation({
          operation: 'write',
          collection: 'progress',
          success: true,
          duration: 123.45,
        });

        const { metrics } = getFirebaseMetrics();
        expect(metrics.length).toBeGreaterThan(0);

        const lastMetric = metrics[metrics.length - 1];
        expect(lastMetric.operation).toBe('write');
        expect(lastMetric.collection).toBe('progress');
        expect(lastMetric.success).toBe(true);
        expect(lastMetric.duration).toBe(123.45);
      });

      it('should track failed operation', () => {
        trackFirebaseOperation({
          operation: 'read',
          collection: 'progress',
          success: false,
          error: 'Network error',
        });

        const { metrics } = getFirebaseMetrics();
        const lastMetric = metrics[metrics.length - 1];

        expect(lastMetric.success).toBe(false);
        expect(lastMetric.error).toBe('Network error');
      });

      it('should limit metrics to 100', () => {
        // Track 150 operations
        for (let i = 0; i < 150; i++) {
          trackFirebaseOperation({
            operation: 'read',
            collection: 'test',
            success: true,
          });
        }

        const { metrics } = getFirebaseMetrics();
        expect(metrics.length).toBeLessThanOrEqual(100);
      });
    });

    describe('getFirebaseMetrics', () => {
      it('should calculate summary statistics', () => {
        trackFirebaseOperation({
          operation: 'read',
          collection: 'progress',
          success: true,
          duration: 100,
        });
        trackFirebaseOperation({
          operation: 'write',
          collection: 'progress',
          success: true,
          duration: 150,
        });
        trackFirebaseOperation({
          operation: 'delete',
          collection: 'progress',
          success: false,
        });
        trackFirebaseOperation({
          operation: 'read',
          collection: 'homework',
          success: true,
          duration: 80,
        });

        const { summary } = getFirebaseMetrics();

        expect(summary.totalOperations).toBe(4);
        expect(summary.reads).toBe(2);
        expect(summary.writes).toBe(1);
        expect(summary.deletes).toBe(1);
        expect(summary.successRate).toBe(75); // 3 out of 4 succeeded
        expect(summary.avgDuration).toBeCloseTo(110, 1); // (100 + 150 + 80) / 3
      });

      it('should handle empty metrics', () => {
        const { summary } = getFirebaseMetrics();

        expect(summary.totalOperations).toBe(0);
        expect(summary.reads).toBe(0);
        expect(summary.writes).toBe(0);
        expect(summary.deletes).toBe(0);
        expect(summary.successRate).toBe(0);
        expect(summary.avgDuration).toBe(0);
      });

      it('should calculate success rate correctly', () => {
        // 7 successes, 3 failures = 70% success rate
        for (let i = 0; i < 7; i++) {
          trackFirebaseOperation({
            operation: 'read',
            collection: 'test',
            success: true,
          });
        }
        for (let i = 0; i < 3; i++) {
          trackFirebaseOperation({
            operation: 'write',
            collection: 'test',
            success: false,
          });
        }

        const { summary } = getFirebaseMetrics();
        expect(summary.successRate).toBe(70);
      });
    });
  });

  describe('User Context', () => {
    it('should set user context', () => {
      setUserContext('user_123', 'test@example.com');

      // User context is internal, but we can verify through exports
      const data = exportTrackingData();
      expect(data).toBeDefined();
    });

    it('should set user context without email', () => {
      expect(() => {
        setUserContext('user_456');
      }).not.toThrow();
    });

    it('should clear user context', () => {
      setUserContext('user_123', 'test@example.com');
      clearUserContext();

      // Should not throw
      expect(() => {
        clearUserContext();
      }).not.toThrow();
    });
  });

  describe('getRecentErrors', () => {
    it('should return recent errors', () => {
      trackError('Error 1');
      trackError('Error 2');
      trackError('Error 3');

      const errors = getRecentErrors();

      expect(errors.length).toBe(3);
      expect(errors[0].message).toBe('Error 1');
      expect(errors[1].message).toBe('Error 2');
      expect(errors[2].message).toBe('Error 3');
    });

    it('should handle empty errors', () => {
      const errors = getRecentErrors();
      expect(errors).toEqual([]);
    });

    it('should handle corrupted sessionStorage', () => {
      sessionStorage.setItem('recent_errors', 'invalid json');

      const errors = getRecentErrors();
      expect(errors).toEqual([]);
    });
  });

  describe('exportTrackingData', () => {
    it('should export all tracking data', () => {
      trackError('Test error');
      trackPerformance({ name: 'test-op', duration: 100 });
      trackFirebaseOperation({
        operation: 'read',
        collection: 'test',
        success: true,
      });

      const data = exportTrackingData();

      expect(data.errors).toBeDefined();
      expect(data.performance).toBeDefined();
      expect(data.firebase).toBeDefined();
      expect(data.config).toBeDefined();

      expect(data.errors.length).toBeGreaterThan(0);
      expect(data.performance.metrics.length).toBeGreaterThan(0);
      expect(data.firebase.metrics.length).toBeGreaterThan(0);
    });

    it('should include summaries', () => {
      trackPerformance({ name: 'op-1', duration: 100 });
      trackPerformance({ name: 'op-1', duration: 200 });
      trackFirebaseOperation({
        operation: 'read',
        collection: 'test',
        success: true,
        duration: 50,
      });

      const data = exportTrackingData();

      expect(data.performance.summary).toBeDefined();
      expect(data.firebase.summary).toBeDefined();

      expect(data.performance.summary['op-1']).toBeDefined();
      expect(data.firebase.summary.totalOperations).toBe(1);
    });
  });

  describe('Global Error Handlers', () => {
    it('should capture uncaught errors', () => {
      // Trigger global error
      const errorEvent = new ErrorEvent('error', {
        error: new Error('Uncaught error'),
        message: 'Uncaught error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
      });

      window.dispatchEvent(errorEvent);

      const errors = getRecentErrors();
      const capturedError = errors.find((e) => e.message === 'Uncaught error');

      expect(capturedError).toBeDefined();
      if (capturedError) {
        expect(capturedError.context?.component).toBe('Global');
        expect(capturedError.context?.metadata?.filename).toBe('test.js');
      }
    });

    it('should capture unhandled rejections', () => {
      // Mock PromiseRejectionEvent (not available in Jest/JSDOM)
      const rejectionEvent = new Event('unhandledrejection') as any;
      rejectionEvent.promise = Promise.reject('Unhandled rejection');
      rejectionEvent.reason = 'Unhandled rejection';

      window.dispatchEvent(rejectionEvent);

      const errors = getRecentErrors();
      const capturedError = errors.find((e) => e.message === 'Unhandled rejection');

      expect(capturedError).toBeDefined();
      if (capturedError) {
        expect(capturedError.context?.component).toBe('Promise');
      }
    });
  });

  describe('Configuration', () => {
    it('should disable tracking when enabled=false', () => {
      initErrorTracking({ enabled: false, enableConsoleLogging: false });

      trackError('Should not be tracked');
      trackPerformance({ name: 'test', duration: 100 });

      const errors = getRecentErrors();
      const { metrics } = getPerformanceMetrics();

      expect(errors).toHaveLength(0);
      expect(metrics).toHaveLength(0);
    });

    it('should disable performance monitoring independently', () => {
      initErrorTracking({
        enabled: true,
        enablePerformanceMonitoring: false,
        enableConsoleLogging: false,
      });

      trackError('Error should be tracked');
      trackPerformance({ name: 'test', duration: 100 });

      const errors = getRecentErrors();
      const { metrics } = getPerformanceMetrics();

      expect(errors.length).toBeGreaterThan(0);
      expect(metrics).toHaveLength(0);
    });

    it('should disable Firebase metrics independently', () => {
      initErrorTracking({
        enabled: true,
        enableFirebaseMetrics: false,
        enableConsoleLogging: false,
      });

      trackFirebaseOperation({
        operation: 'read',
        collection: 'test',
        success: true,
      });

      const { metrics } = getFirebaseMetrics();
      expect(metrics).toHaveLength(0);
    });
  });
});
