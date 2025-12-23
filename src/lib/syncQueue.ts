/**
 * Offline Sync Queue
 *
 * Queues failed sync operations and retries them when connection is restored.
 * Prevents data loss when users work offline or have intermittent connectivity.
 */

export type SyncOperation = () => Promise<void>;

export interface QueuedOperation {
  id: string;
  operation: SyncOperation;
  type: 'progress' | 'homework' | 'submission';
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export interface SyncQueueStatus {
  isOnline: boolean;
  queueLength: number;
  isProcessing: boolean;
  lastSyncAttempt: number | null;
  failedOperations: number;
  oldestOperation?: number;
}

/**
 * Singleton sync queue manager
 */
class SyncQueueManager {
  private queue: QueuedOperation[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isProcessing: boolean = false;
  private maxQueueSize: number = 100; // Prevent memory leaks
  private maxRetries: number = 5;
  private processingInterval: number | null = null;
  private lastSyncAttempt: number | null = null;
  private listeners: Set<(status: SyncQueueStatus) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.loadQueueFromStorage();
      this.startPeriodicProcessing();
    }
  }

  /**
   * Set up online/offline event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Also check connection on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        this.processQueue();
      }
    });
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    console.log('🌐 Connection restored - processing sync queue');
    this.isOnline = true;
    this.notifyListeners();
    this.processQueue();
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    console.log('📡 Connection lost - queuing sync operations');
    this.isOnline = false;
    this.notifyListeners();
  };

  /**
   * Add operation to queue
   *
   * @param operation - Async function to execute
   * @param type - Type of operation
   * @returns Operation ID
   */
  public add(
    operation: SyncOperation,
    type: QueuedOperation['type'] = 'progress'
  ): string {
    // Check queue size limit
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('Sync queue full - removing oldest operation');
      this.queue.shift();
    }

    const id = this.generateId();
    const queuedOp: QueuedOperation = {
      id,
      operation,
      type,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedOp);
    this.saveQueueToStorage();
    this.notifyListeners();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Process all queued operations
   */
  public async processQueue(): Promise<void> {
    if (!this.isOnline || this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.lastSyncAttempt = Date.now();
    this.notifyListeners();

    console.log(`Processing ${this.queue.length} queued operation(s)...`);

    // Process operations in order (FIFO)
    while (this.queue.length > 0 && this.isOnline) {
      const queuedOp = this.queue[0];

      try {
        await queuedOp.operation();

        // Success - remove from queue
        this.queue.shift();
        console.log(`✓ Processed ${queuedOp.type} operation (ID: ${queuedOp.id})`);
      } catch (error) {
        queuedOp.retryCount++;
        queuedOp.lastError = error instanceof Error ? error.message : 'Unknown error';

        console.error(
          `✗ Failed ${queuedOp.type} operation (attempt ${queuedOp.retryCount}/${this.maxRetries}):`,
          error
        );

        // Check if max retries exceeded
        if (queuedOp.retryCount >= this.maxRetries) {
          console.error(
            `Max retries exceeded for operation ${queuedOp.id} - removing from queue`
          );
          this.queue.shift();
        } else {
          // Move to back of queue for retry
          this.queue.shift();
          this.queue.push(queuedOp);
        }

        // Stop processing if we hit an error (will retry later)
        break;
      }
    }

    this.isProcessing = false;
    this.saveQueueToStorage();
    this.notifyListeners();

    if (this.queue.length > 0) {
      console.log(`${this.queue.length} operation(s) remaining in queue`);
    }
  }

  /**
   * Clear all queued operations
   */
  public clearQueue(): void {
    this.queue = [];
    this.saveQueueToStorage();
    this.notifyListeners();
    console.log('Sync queue cleared');
  }

  /**
   * Get current queue status
   */
  public getStatus(): SyncQueueStatus {
    return {
      isOnline: this.isOnline,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      lastSyncAttempt: this.lastSyncAttempt,
      failedOperations: this.queue.filter((op) => op.retryCount > 0).length,
      oldestOperation: this.queue.length > 0 ? this.queue[0].timestamp : undefined,
    };
  }

  /**
   * Subscribe to queue status changes
   *
   * @param listener - Callback function
   * @returns Unsubscribe function
   */
  public subscribe(listener: (status: SyncQueueStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Save queue to localStorage for persistence
   */
  private saveQueueToStorage(): void {
    try {
      // We can't serialize functions, so just save metadata
      const metadata = this.queue.map((op) => ({
        id: op.id,
        type: op.type,
        timestamp: op.timestamp,
        retryCount: op.retryCount,
        lastError: op.lastError,
      }));

      localStorage.setItem('sync_queue_metadata', JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to save sync queue to storage:', error);
    }
  }

  /**
   * Load queue metadata from localStorage
   *
   * Note: Operations themselves can't be restored (they're functions),
   * but we keep the metadata for diagnostics
   */
  private loadQueueFromStorage(): void {
    try {
      const metadataStr = localStorage.getItem('sync_queue_metadata');
      if (metadataStr) {
        const metadata = JSON.parse(metadataStr);
        console.log(
          `Found ${metadata.length} pending operation(s) from previous session`
        );

        // We can't restore the actual operations, but we log for debugging
        if (metadata.length > 0) {
          console.warn(
            'Previous sync operations could not be restored - ensure app syncs on next action'
          );
        }

        // Clear old metadata
        localStorage.removeItem('sync_queue_metadata');
      }
    } catch (error) {
      console.error('Failed to load sync queue from storage:', error);
    }
  }

  /**
   * Start periodic queue processing (every 30 seconds)
   */
  private startPeriodicProcessing(): void {
    this.processingInterval = window.setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.processQueue();
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop periodic processing (cleanup)
   */
  public destroy(): void {
    if (this.processingInterval !== null) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    this.listeners.clear();
  }

  /**
   * Generate unique operation ID
   */
  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get queue items (for debugging/admin)
   */
  public getQueueItems(): Array<Omit<QueuedOperation, 'operation'>> {
    return this.queue.map((op) => ({
      id: op.id,
      type: op.type,
      timestamp: op.timestamp,
      retryCount: op.retryCount,
      lastError: op.lastError,
    }));
  }
}

// Export singleton instance
export const syncQueue = new SyncQueueManager();

/**
 * Helper function to wrap sync operations with queue fallback
 *
 * @param operation - Sync operation to execute
 * @param type - Type of operation
 * @returns Promise that resolves when operation completes or is queued
 */
export async function syncWithFallback(
  operation: SyncOperation,
  type: QueuedOperation['type'] = 'progress'
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    console.warn(`Sync failed - adding to queue:`, error);
    syncQueue.add(operation, type);
  }
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Wait for online status
 *
 * @param timeout - Max time to wait in ms (default: 30000)
 * @returns Promise that resolves when online or rejects on timeout
 */
export function waitForOnline(timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      reject(new Error('Timeout waiting for online status'));
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve();
    };

    window.addEventListener('online', onlineHandler);
  });
}
