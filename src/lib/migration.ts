/**
 * Data Migration System
 *
 * Handles backward-compatible migrations of localStorage data
 * as the app schema evolves over time.
 */

import type { UserStoreState } from '@/stores/userStore';
import type { SessionState } from '@/stores/sessionStore';
import type { Homework1Progress } from '@/types/homework';

/**
 * Current schema version
 *
 * Increment this when making breaking changes to data structure
 */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean;
  version: number;
  migrationsApplied: string[];
  errors: string[];
}

/**
 * Migrate user store data from old schema to new schema
 *
 * @param data - Raw data from localStorage
 * @returns Migrated data compatible with current schema
 */
export function migrateUserStore(data: any): {
  data: Partial<UserStoreState>;
  result: MigrationResult;
} {
  const result: MigrationResult = {
    success: true,
    version: data.migrationVersion || 0,
    migrationsApplied: [],
    errors: [],
  };

  try {
    let migratedData = { ...data };

    // Version 0 → Version 1: Add cloud sync tracking fields
    if (result.version < 1) {
      migratedData = migrateV0toV1(migratedData);
      result.migrationsApplied.push('v0→v1: Added cloud sync tracking');
      result.version = 1;
    }

    // Version 1 → Version 2: Add session persistence fields
    if (result.version < 2) {
      migratedData = migrateV1toV2(migratedData);
      result.migrationsApplied.push('v1→v2: Added session persistence');
      result.version = 2;
    }

    // Set final version
    migratedData.migrationVersion = CURRENT_SCHEMA_VERSION;

    return { data: migratedData, result };
  } catch (error) {
    result.success = false;
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown migration error'
    );
    return { data, result };
  }
}

/**
 * Migration V0 → V1: Add cloud sync tracking fields
 */
function migrateV0toV1(data: any): any {
  const state = data.state || {};

  return {
    ...data,
    state: {
      ...state,
      // Add cloud sync status fields
      syncStatus: 'never_synced' as const,
      lastCloudSync: null,

      // Preserve existing data
      stats: state.stats || {
        xp: 0,
        level: 1,
        streak: 0,
        longestStreak: 0,
        lastStudyDate: null,
        achievements: [],
        wordsLearned: 0,
        wordsInProgress: 0,
        totalReviews: 0,
        correctReviews: 0,
      },
      progress: state.progress || {},
    },
  };
}

/**
 * Migration V1 → V2: Add session persistence fields
 */
function migrateV1toV2(data: any): any {
  const state = data.state || {};

  return {
    ...data,
    state: {
      ...state,
      // Add session persistence support
      sessionPersistence: true,
      sessionHistory: state.sessionHistory || [],
      lastSessionTimestamp: state.lastSessionTimestamp || null,

      // Preserve existing data
      stats: state.stats,
      progress: state.progress,
      syncStatus: state.syncStatus,
      lastCloudSync: state.lastCloudSync,
    },
  };
}

/**
 * Migrate session store data
 *
 * @param data - Raw session data from localStorage
 * @returns Migrated session data
 */
export function migrateSessionStore(data: any): {
  data: Partial<SessionState>;
  result: MigrationResult;
} {
  const result: MigrationResult = {
    success: true,
    version: data.migrationVersion || 0,
    migrationsApplied: [],
    errors: [],
  };

  try {
    let migratedData = { ...data };

    // Version 0 → Version 1: Add streak tracking
    if (result.version < 1) {
      migratedData = {
        ...migratedData,
        currentStreak: migratedData.currentStreak || 0,
        bestStreak: migratedData.bestStreak || 0,
      };
      result.migrationsApplied.push('v0→v1: Added streak tracking');
      result.version = 1;
    }

    migratedData.migrationVersion = CURRENT_SCHEMA_VERSION;

    return { data: migratedData, result };
  } catch (error) {
    result.success = false;
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown migration error'
    );
    return { data, result };
  }
}

/**
 * Migrate homework progress data
 *
 * @param data - Raw homework data from localStorage
 * @returns Migrated homework data
 */
export function migrateHomeworkStore(data: any): {
  data: any;
  result: MigrationResult;
} {
  const result: MigrationResult = {
    success: true,
    version: data.migrationVersion || 0,
    migrationsApplied: [],
    errors: [],
  };

  try {
    let migratedData = { ...data };

    // Version 0 → Version 1: Ensure section structure
    if (result.version < 1) {
      if (migratedData.homework1) {
        // Ensure all sections exist
        const sections = migratedData.homework1.sections || {};
        for (let i = 1; i <= 5; i++) {
          if (!sections[i]) {
            sections[i] = {
              status: 'not_started',
              answers: [],
              score: 0,
              totalQuestions: 0,
              startedAt: undefined,
              completedAt: undefined,
            };
          }
        }
        migratedData.homework1.sections = sections;
      }
      result.migrationsApplied.push('v0→v1: Ensured section structure');
      result.version = 1;
    }

    migratedData.migrationVersion = CURRENT_SCHEMA_VERSION;

    return { data: migratedData, result };
  } catch (error) {
    result.success = false;
    result.errors.push(
      error instanceof Error ? error.message : 'Unknown migration error'
    );
    return { data, result };
  }
}

/**
 * Validate migrated data structure
 *
 * @param data - Migrated data to validate
 * @param storeName - Name of the store ('user' | 'session' | 'homework')
 * @returns Validation result
 */
export function validateMigratedData(
  data: any,
  storeName: 'user' | 'session' | 'homework'
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Check migration version exists
    if (typeof data.migrationVersion !== 'number') {
      errors.push('Missing or invalid migrationVersion');
    }

    // Store-specific validation
    switch (storeName) {
      case 'user':
        if (!data.stats || typeof data.stats !== 'object') {
          errors.push('Missing or invalid stats object');
        }
        if (!data.progress || typeof data.progress !== 'object') {
          errors.push('Missing or invalid progress object');
        }
        break;

      case 'session':
        if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
          errors.push('Invalid isActive field');
        }
        break;

      case 'homework':
        if (data.homework1 && !data.homework1.sections) {
          errors.push('Missing sections in homework1');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : 'Validation error'
    );
    return { valid: false, errors };
  }
}

/**
 * Log migration results for debugging
 *
 * @param storeName - Name of the store
 * @param result - Migration result
 */
export function logMigrationResult(
  storeName: string,
  result: MigrationResult
): void {
  if (!result.success) {
    console.error(`Migration failed for ${storeName}:`, result.errors);
    return;
  }

  if (result.migrationsApplied.length > 0) {
    console.log(
      `Successfully migrated ${storeName} from v${result.version - result.migrationsApplied.length} to v${result.version}:`
    );
    result.migrationsApplied.forEach((migration) => {
      console.log(`  ✓ ${migration}`);
    });
  }
}

/**
 * Backup data before migration
 *
 * Creates a timestamped backup in localStorage
 *
 * @param storeName - Name of the store
 * @param data - Data to backup
 */
export function backupBeforeMigration(storeName: string, data: any): void {
  try {
    const backupKey = `${storeName}_backup_${Date.now()}`;
    const backupData = {
      timestamp: new Date().toISOString(),
      version: data.migrationVersion || data.version || 0,
      data,
    };
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    console.log(`Created backup: ${backupKey}`);
  } catch (error) {
    console.error('Failed to create backup:', error);
  }
}

/**
 * Restore from backup
 *
 * @param backupKey - Backup key to restore from
 * @returns Restored data or null if not found
 */
export function restoreFromBackup(backupKey: string): any {
  try {
    const backupStr = localStorage.getItem(backupKey);
    if (!backupStr) {
      console.error(`Backup not found: ${backupKey}`);
      return null;
    }

    const backup = JSON.parse(backupStr);
    console.log(
      `Restoring backup from ${backup.timestamp} (v${backup.version})`
    );
    return backup.data;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return null;
  }
}

/**
 * Clean up old backups
 *
 * @param storeName - Optional store name to filter backups
 * @param retentionDays - Number of days to keep backups (default: keeps last 5 backups)
 */
export function cleanupOldBackups(storeName?: string, retentionDays?: number): void {
  try {
    const backupKeys: string[] = [];
    const now = Date.now();

    // Find all backup keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_backup_')) {
        // Filter by store name if provided
        if (storeName && !key.startsWith(`${storeName}_backup_`)) {
          continue;
        }
        backupKeys.push(key);
      }
    }

    if (retentionDays !== undefined) {
      // Remove backups older than retention period
      const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
      backupKeys.forEach((key) => {
        const timestamp = parseInt(key.split('_backup_')[1] || '0');
        if (now - timestamp > retentionMs) {
          localStorage.removeItem(key);
          console.log(`Removed old backup: ${key}`);
        }
      });
    } else {
      // Sort by timestamp (newest first)
      backupKeys.sort((a, b) => {
        const timestampA = parseInt(a.split('_backup_')[1] || '0');
        const timestampB = parseInt(b.split('_backup_')[1] || '0');
        return timestampB - timestampA;
      });

      // Remove old backups (keep only 5 most recent)
      const toRemove = backupKeys.slice(5);
      toRemove.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`Removed old backup: ${key}`);
      });

      if (toRemove.length > 0) {
        console.log(`Cleaned up ${toRemove.length} old backup(s)`);
      }
    }
  } catch (error) {
    console.error('Failed to cleanup backups:', error);
  }
}
