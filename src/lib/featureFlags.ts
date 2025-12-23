/**
 * Feature Flags System
 *
 * Allows gradual rollout and A/B testing of new features.
 * Can be toggled globally or per-user for beta testing.
 */

export interface FeatureFlags {
  // Cloud sync features
  CLOUD_SYNC_LEARNING: boolean;      // Sync learning progress to Firebase
  CLOUD_SYNC_HOMEWORK: boolean;       // Sync homework progress to Firebase
  BATCH_SYNC: boolean;                // Use batched syncing (30s debounce)
  IMMEDIATE_HOMEWORK_SYNC: boolean;   // Immediate homework sync (no debounce)

  // Data persistence features
  COMPRESSION: boolean;               // Enable compression for large datasets
  OFFLINE_QUEUE: boolean;             // Enable offline sync queue
  ENHANCED_VALIDATION: boolean;       // Enhanced data validation
  CORRUPTED_DATA_RECOVERY: boolean;   // Attempt recovery from corrupted localStorage

  // Performance features
  WEB_WORKER_SYNC: boolean;          // Run sync operations in Web Worker
  INDEXEDDB_STORAGE: boolean;        // Use IndexedDB for large datasets

  // Experimental features
  TIMEZONE_FIX: boolean;             // Use local timezone instead of UTC
  SESSION_PERSIST: boolean;          // Persist session data
}

/**
 * Default feature flags - conservative settings for production
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Cloud sync features - All enabled after P1 completion
  CLOUD_SYNC_LEARNING: true,
  CLOUD_SYNC_HOMEWORK: true,
  BATCH_SYNC: true,
  IMMEDIATE_HOMEWORK_SYNC: true,

  // Data persistence features - Gradual rollout
  COMPRESSION: false,                 // P2 - Not yet implemented
  OFFLINE_QUEUE: false,               // P2 - Not yet implemented
  ENHANCED_VALIDATION: false,         // P2 - Not yet implemented
  CORRUPTED_DATA_RECOVERY: true,      // P0 - Already implemented

  // Performance features - Future enhancements
  WEB_WORKER_SYNC: false,            // P3 - Future optimization
  INDEXEDDB_STORAGE: false,          // P3 - Future enhancement

  // Experimental features
  TIMEZONE_FIX: false,               // P2 - Ready to implement
  SESSION_PERSIST: true,             // P0 - Already implemented
};

/**
 * Beta tester UIDs - users who get all features enabled
 *
 * Add user UIDs here for beta testing new features
 */
const BETA_TESTERS: string[] = [
  // Example: 'uid_12345',
  // Add beta tester UIDs here
];

/**
 * A/B test groups - users assigned to specific test variants
 *
 * Example use case: Test if compression improves performance
 */
interface ABTestGroups {
  compression_test?: 'enabled' | 'disabled';
  offline_queue_test?: 'enabled' | 'disabled';
}

const AB_TEST_ASSIGNMENTS: Record<string, ABTestGroups> = {
  // Example:
  // 'uid_67890': { compression_test: 'enabled' },
};

/**
 * Get feature flags for a specific user
 *
 * @param uid - User ID (optional). If not provided, returns default flags
 * @returns Feature flags object with all flags resolved
 */
export function getFeatureFlags(uid?: string): FeatureFlags {
  // Start with default flags
  let flags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };

  // If no user, return defaults
  if (!uid) {
    return flags;
  }

  // Beta testers get all features enabled
  if (BETA_TESTERS.includes(uid)) {
    return Object.keys(flags).reduce((acc, key) => {
      acc[key as keyof FeatureFlags] = true;
      return acc;
    }, {} as FeatureFlags);
  }

  // Apply A/B test assignments
  const userTests = AB_TEST_ASSIGNMENTS[uid];
  if (userTests) {
    if (userTests.compression_test === 'enabled') {
      flags.COMPRESSION = true;
    }
    if (userTests.offline_queue_test === 'enabled') {
      flags.OFFLINE_QUEUE = true;
    }
  }

  return flags;
}

/**
 * Check if a specific feature is enabled for a user
 *
 * @param feature - Feature flag name
 * @param uid - User ID (optional)
 * @returns true if feature is enabled, false otherwise
 */
export function isFeatureEnabled(
  feature: keyof FeatureFlags,
  uid?: string
): boolean {
  const flags = getFeatureFlags(uid);
  return flags[feature];
}

/**
 * Add a user to beta testing program
 *
 * @param uid - User ID to add
 */
export function addBetaTester(uid: string): void {
  if (!BETA_TESTERS.includes(uid)) {
    BETA_TESTERS.push(uid);
    console.log(`Added beta tester: ${uid}`);
  }
}

/**
 * Remove a user from beta testing program
 *
 * @param uid - User ID to remove
 */
export function removeBetaTester(uid: string): void {
  const index = BETA_TESTERS.indexOf(uid);
  if (index > -1) {
    BETA_TESTERS.splice(index, 1);
    console.log(`Removed beta tester: ${uid}`);
  }
}

/**
 * Assign a user to an A/B test group
 *
 * @param uid - User ID
 * @param testName - Name of the A/B test
 * @param variant - Test variant ('enabled' or 'disabled')
 */
export function assignABTest(
  uid: string,
  testName: keyof ABTestGroups,
  variant: 'enabled' | 'disabled'
): void {
  if (!AB_TEST_ASSIGNMENTS[uid]) {
    AB_TEST_ASSIGNMENTS[uid] = {};
  }
  AB_TEST_ASSIGNMENTS[uid][testName] = variant;
  console.log(`Assigned ${uid} to ${testName}: ${variant}`);
}

/**
 * Get current feature flags status summary
 *
 * Useful for debugging and admin dashboards
 */
export function getFeatureFlagsSummary(): {
  defaultFlags: FeatureFlags;
  betaTesterCount: number;
  abTestCount: number;
} {
  return {
    defaultFlags: DEFAULT_FEATURE_FLAGS,
    betaTesterCount: BETA_TESTERS.length,
    abTestCount: Object.keys(AB_TEST_ASSIGNMENTS).length,
  };
}
