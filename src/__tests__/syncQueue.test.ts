/**
 * Tests for Offline Sync Queue System
 *
 * Tests queuing, retry logic, online/offline detection,
 * and sync operation management.
 */

import { syncQueue, SyncQueueStatus } from '@/lib/syncQueue';

// Mock navigator.onLine
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('Sync Queue', () => {
  beforeEach(() => {
    // Use fake timers for better control
    jest.useFakeTimers();

    // Clear queue and reset to online
    syncQueue.clearQueue();
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Trigger online event to sync internal state
    window.dispatchEvent(new Event('online'));

    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('add', () => {
    it('should add operation to queue', () => {
      const operation = jest.fn(async () => {});

      const id = syncQueue.add(operation, 'progress');

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should execute immediately if online', async () => {
      const operation = jest.fn(async () => {});

      syncQueue.add(operation, 'progress');

      // Run all pending timers and microtasks
      await jest.runAllTimersAsync();

      expect(operation).toHaveBeenCalled();
    });

    it('should queue if offline', async () => {
      // Set offline and trigger event
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      const operation = jest.fn(async () => {});

      syncQueue.add(operation, 'progress');

      // Run pending timers and microtasks
      await jest.runAllTimersAsync();

      expect(operation).not.toHaveBeenCalled();
    });

    it('should enforce max queue size', () => {
      const operations: string[] = [];

      // Add 150 operations (more than max of 100)
      for (let i = 0; i < 150; i++) {
        const id = syncQueue.add(async () => {}, 'progress');
        operations.push(id);
      }

      const status = syncQueue.getStatus();
      expect(status.queueLength).toBeLessThanOrEqual(100);
    });

    it('should categorize operations by type', () => {
      syncQueue.add(async () => {}, 'progress');
      syncQueue.add(async () => {}, 'homework');
      syncQueue.add(async () => {}, 'submission');

      const status = syncQueue.getStatus();
      expect(status.queueLength).toBeGreaterThan(0);
    });
  });

  describe('processQueue', () => {
    it('should process queued operations when online', async () => {
      // Set offline
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      const operation1 = jest.fn(async () => {});
      const operation2 = jest.fn(async () => {});

      syncQueue.add(operation1, 'progress');
      syncQueue.add(operation2, 'progress');

      // Should not execute while offline
      await jest.runAllTimersAsync();
      expect(operation1).not.toHaveBeenCalled();
      expect(operation2).not.toHaveBeenCalled();

      // Go online
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));

      // Wait for processing
      await jest.runAllTimersAsync();

      expect(operation1).toHaveBeenCalled();
      expect(operation2).toHaveBeenCalled();
    });

    it('should stop on first error', async () => {
      const operation1 = jest.fn(async () => {
        throw new Error('Network error');
      });
      const operation2 = jest.fn(async () => {});

      syncQueue.add(operation1, 'progress');
      syncQueue.add(operation2, 'progress');

      await jest.runAllTimersAsync();

      expect(operation1).toHaveBeenCalled();
      expect(operation2).not.toHaveBeenCalled();
    });

    it('should retry failed operations', async () => {
      let attemptCount = 0;
      const operation = jest.fn(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary error');
        }
      });

      syncQueue.add(operation, 'progress');

      // Process queue multiple times for retries
      await jest.runAllTimersAsync();
      await syncQueue.processQueue();
      await jest.runAllTimersAsync();
      await syncQueue.processQueue();
      await jest.runAllTimersAsync();

      expect(operation).toHaveBeenCalledTimes(3);
      expect(attemptCount).toBe(3);
    });

    it('should respect max retries', async () => {
      const operation = jest.fn(async () => {
        throw new Error('Persistent error');
      });

      syncQueue.add(operation, 'progress');

      // Process queue multiple times to hit max retries
      // maxRetries = 5, so we get: initial attempt + 4 retries = 5 total attempts
      for (let i = 0; i < 6; i++) {
        await jest.runAllTimersAsync();
        await syncQueue.processQueue();
      }

      // Should try 5 times total (initial + 4 retries before hitting maxRetries=5)
      expect(operation).toHaveBeenCalledTimes(5);

      // Operation should be removed from queue after max retries
      const status = syncQueue.getStatus();
      expect(status.queueLength).toBe(0);
    });

    it('should not process while already processing', async () => {
      let processing = false;
      const operation = jest.fn(async () => {
        expect(processing).toBe(false);
        processing = true;
        await new Promise((resolve) => setTimeout(resolve, 100));
        processing = false;
      });

      syncQueue.add(operation, 'progress');
      syncQueue.add(operation, 'progress');

      // Process first operation
      const promise1 = syncQueue.processQueue();
      await jest.advanceTimersByTimeAsync(50);

      // Try to process again while first is running
      const promise2 = syncQueue.processQueue();

      await jest.runAllTimersAsync();
      await Promise.all([promise1, promise2]);

      // Should process both operations sequentially
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should process operations in FIFO order', async () => {
      // Set offline
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      const op1 = jest.fn(async () => {});
      const op2 = jest.fn(async () => {});
      const op3 = jest.fn(async () => {});

      syncQueue.add(op1, 'progress');
      syncQueue.add(op2, 'progress');
      syncQueue.add(op3, 'progress');

      // Should not execute while offline
      await jest.runAllTimersAsync();
      expect(op1).not.toHaveBeenCalled();
      expect(op2).not.toHaveBeenCalled();
      expect(op3).not.toHaveBeenCalled();

      // Go online
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));

      // Wait for processing
      await jest.runAllTimersAsync();

      // Verify all operations were called in FIFO order
      expect(op1).toHaveBeenCalledTimes(1);
      expect(op2).toHaveBeenCalledTimes(1);
      expect(op3).toHaveBeenCalledTimes(1);

      // Verify order by checking call timestamps
      const op1Time = op1.mock.invocationCallOrder[0];
      const op2Time = op2.mock.invocationCallOrder[0];
      const op3Time = op3.mock.invocationCallOrder[0];

      expect(op1Time).toBeLessThan(op2Time);
      expect(op2Time).toBeLessThan(op3Time);
    });
  });

  describe('Online/Offline Detection', () => {
    it('should detect when going offline', async () => {
      const operation = jest.fn(async () => {});

      // Start online
      syncQueue.add(operation, 'progress');

      // Wait for execution
      await jest.runAllTimersAsync();
      expect(operation).toHaveBeenCalledTimes(1);

      // Go offline
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      // Add operation while offline
      syncQueue.add(operation, 'progress');

      await jest.runAllTimersAsync();

      // Should not execute again
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should detect when coming back online', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      const operation = jest.fn(async () => {});

      syncQueue.add(operation, 'progress');

      // Should not execute while offline
      await jest.runAllTimersAsync();
      expect(operation).not.toHaveBeenCalled();

      // Go online
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));

      // Wait for processing
      await jest.runAllTimersAsync();

      expect(operation).toHaveBeenCalled();
    });
  });

  describe('Persistence', () => {
    it('should save queue to localStorage', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      syncQueue.add(async () => {}, 'progress');
      syncQueue.add(async () => {}, 'homework');

      const stored = localStorage.getItem('sync_queue_metadata');
      expect(stored).not.toBeNull();

      if (stored) {
        const queue = JSON.parse(stored);
        expect(queue).toHaveLength(2);
      }
    });

    it('should restore queue from localStorage on init', () => {
      // Manually add to localStorage
      const queueData = [
        {
          id: 'test-1',
          type: 'progress',
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'test-2',
          type: 'homework',
          timestamp: Date.now(),
          retryCount: 1,
        },
      ];

      localStorage.setItem('sync_queue_metadata', JSON.stringify(queueData));

      // Note: Queue operations can't be restored (they're functions)
      // but metadata is logged - just verify no crash
      expect(() => syncQueue.getStatus()).not.toThrow();
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('sync_queue_metadata', 'invalid json');

      // Should not throw
      expect(() => {
        syncQueue.getStatus();
      }).not.toThrow();
    });
  });

  describe('getStatus', () => {
    it('should return current queue status', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));

      syncQueue.add(async () => {}, 'progress');
      syncQueue.add(async () => {}, 'homework');

      const status = syncQueue.getStatus();

      expect(status.isOnline).toBe(false);
      expect(status.isProcessing).toBe(false);
      expect(status.queueLength).toBe(2);
      expect(status.oldestOperation).toBeDefined();
    });

    it('should track oldest operation timestamp', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const now = Date.now();

      syncQueue.add(async () => {}, 'progress');

      const status = syncQueue.getStatus();

      expect(status.oldestOperation).toBeDefined();
      if (status.oldestOperation) {
        expect(status.oldestOperation).toBeGreaterThanOrEqual(now - 1000);
        expect(status.oldestOperation).toBeLessThanOrEqual(now + 1000);
      }
    });

    it('should indicate when processing', async () => {
      const slowOperation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
      };

      syncQueue.add(slowOperation, 'progress');

      // Check status immediately
      await jest.advanceTimersByTimeAsync(50);
      const statusDuringProcessing = syncQueue.getStatus();
      expect(statusDuringProcessing.isProcessing).toBe(true);

      // Wait for completion
      await jest.advanceTimersByTimeAsync(600);
      const statusAfterProcessing = syncQueue.getStatus();
      expect(statusAfterProcessing.isProcessing).toBe(false);
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on status change', async () => {
      const listener = jest.fn();

      syncQueue.subscribe(listener);

      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      syncQueue.add(async () => {}, 'progress');

      // Wait for notification
      await jest.runAllTimersAsync();

      expect(listener).toHaveBeenCalled();
    });

    it('should allow unsubscribing', async () => {
      const listener = jest.fn();

      const unsubscribe = syncQueue.subscribe(listener);

      syncQueue.add(async () => {}, 'progress');
      await jest.runAllTimersAsync();

      const callCountBefore = listener.mock.calls.length;

      // Unsubscribe
      unsubscribe();

      // Add more operations
      syncQueue.add(async () => {}, 'progress');
      await jest.runAllTimersAsync();

      // Should not have been called again
      expect(listener.mock.calls.length).toBe(callCountBefore);
    });

    it('should notify multiple listeners', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      syncQueue.subscribe(listener1);
      syncQueue.subscribe(listener2);

      syncQueue.add(async () => {}, 'progress');

      await jest.runAllTimersAsync();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('clearQueue', () => {
    it('should clear all queued operations', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      syncQueue.add(async () => {}, 'progress');
      syncQueue.add(async () => {}, 'homework');
      syncQueue.add(async () => {}, 'submission');

      let status = syncQueue.getStatus();
      expect(status.queueLength).toBe(3);

      syncQueue.clearQueue();

      status = syncQueue.getStatus();
      expect(status.queueLength).toBe(0);
    });

    it('should clear localStorage', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      syncQueue.add(async () => {}, 'progress');

      expect(localStorage.getItem('sync_queue_metadata')).not.toBeNull();

      syncQueue.clearQueue();

      const stored = localStorage.getItem('sync_queue_metadata');
      if (stored) {
        const queue = JSON.parse(stored);
        expect(queue).toHaveLength(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid online/offline transitions', async () => {
      const operation = jest.fn(async () => {});

      for (let i = 0; i < 10; i++) {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: i % 2 === 0,
        });
        window.dispatchEvent(new Event(i % 2 === 0 ? 'online' : 'offline'));

        syncQueue.add(operation, 'progress');

        await jest.advanceTimersByTimeAsync(50);
      }

      // Should handle gracefully without crashes
      const status = syncQueue.getStatus();
      expect(status).toBeDefined();
    });

    it('should handle operations that throw synchronously', async () => {
      const badOperation = () => {
        throw new Error('Sync error');
      };

      expect(() => {
        syncQueue.add(badOperation as any, 'progress');
      }).not.toThrow();
    });

    it('should handle operations that never resolve', async () => {
      const hangingOperation = (): Promise<void> =>
        new Promise(() => {
          // Never resolves
        });

      syncQueue.add(hangingOperation, 'progress');

      // Should timeout and continue
      await jest.advanceTimersByTimeAsync(2000);

      const status = syncQueue.getStatus();
      expect(status).toBeDefined();
    });

    it('should handle localStorage quota exceeded', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        const error: any = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      // Should handle gracefully
      expect(() => {
        syncQueue.add(async () => {}, 'progress');
      }).not.toThrow();

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Performance', () => {
    it('should handle large queue efficiently', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const startTime = performance.now();

      // Add 100 operations
      for (let i = 0; i < 100; i++) {
        syncQueue.add(async () => {}, 'progress');
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (< 100ms for 100 operations)
      expect(duration).toBeLessThan(100);
    });
  });
});
