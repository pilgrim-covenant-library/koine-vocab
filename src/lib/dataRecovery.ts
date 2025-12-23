/**
 * Data Recovery System
 *
 * Attempts to recover user data from corrupted localStorage state.
 * Provides fallback mechanisms and partial recovery options.
 */

import type { WordProgress, UserStats } from '@/types';
import {
  sanitizeWordProgress,
  sanitizeUserStats,
  sanitizeProgress,
  validateUserStoreState,
  detectDataIssues,
  deepSanitize,
} from './dataValidation';
import { migrateUserStore, migrateSessionStore, migrateHomeworkStore } from './migration';

export interface RecoveryResult {
  success: boolean;
  recovered: boolean;
  partialRecovery: boolean;
  errors: string[];
  warnings: string[];
  recoveredData?: any;
  lostData?: string[];
}

/**
 * Attempt to recover corrupted user store data
 *
 * Recovery strategy:
 * 1. Try to parse JSON (catch syntax errors)
 * 2. Validate structure
 * 3. Detect and fix data issues (NaN, Infinity, etc.)
 * 4. Attempt migration if needed
 * 5. Sanitize all values
 * 6. Return best possible recovered state
 *
 * @param rawData - Corrupted data string from localStorage
 * @returns Recovery result with recovered data or errors
 */
export function recoverUserStore(rawData: string): RecoveryResult {
  const result: RecoveryResult = {
    success: false,
    recovered: false,
    partialRecovery: false,
    errors: [],
    warnings: [],
    lostData: [],
  };

  try {
    // Step 1: Try to parse JSON
    let data: any;
    try {
      data = JSON.parse(rawData);
    } catch (parseError) {
      result.errors.push('JSON parse error - attempting repair');

      // Attempt to repair common JSON corruption
      const repairedData = attemptJSONRepair(rawData);
      if (repairedData) {
        data = repairedData;
        result.warnings.push('JSON was repaired - some data may be lost');
        result.partialRecovery = true;
      } else {
        result.errors.push('JSON repair failed');
        return result;
      }
    }

    // Step 2: Validate basic structure
    const validation = validateUserStoreState(data);
    result.warnings.push(...validation.warnings);

    if (!validation.isValid) {
      result.errors.push(...validation.errors);
      result.warnings.push('Attempting partial recovery');
    }

    // Step 3: Detect data issues
    const issues = detectDataIssues(data);
    if (issues.length > 0) {
      result.warnings.push(...issues);
      result.warnings.push('Sanitizing corrupted values');
    }

    // Step 4: Attempt migration if needed
    const migrationResult = migrateUserStore(data);
    if (!migrationResult.result.success) {
      result.errors.push(...migrationResult.result.errors);
    } else if (migrationResult.result.migrationsApplied.length > 0) {
      result.warnings.push(...migrationResult.result.migrationsApplied);
    }
    data = migrationResult.data;

    // Step 5: Recover what we can
    const recoveredState = recoverUserStoreState(data.state || data);

    if (recoveredState) {
      result.recoveredData = { state: recoveredState, version: 0 };
      result.recovered = true;
      result.success = true;

      // Check what was lost
      const lostData = detectLostData(data.state || data, recoveredState);
      if (lostData.length > 0) {
        result.lostData = lostData;
        result.partialRecovery = true;
        result.warnings.push(`Lost data: ${lostData.join(', ')}`);
      }
    } else {
      result.errors.push('Could not recover any valid data');
    }

    return result;
  } catch (error) {
    result.errors.push(
      `Recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return result;
  }
}

/**
 * Attempt to repair malformed JSON
 *
 * Common issues:
 * - Truncated JSON (missing closing braces)
 * - Unescaped quotes in strings
 * - Trailing commas
 * - NaN/Infinity values
 *
 * @param jsonStr - Malformed JSON string
 * @returns Parsed object or null if repair failed
 */
function attemptJSONRepair(jsonStr: string): any {
  try {
    // Remove trailing commas
    let repaired = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    // Replace NaN and Infinity with null
    repaired = repaired.replace(/:\s*NaN\b/g, ': null');
    repaired = repaired.replace(/:\s*Infinity\b/g, ': null');
    repaired = repaired.replace(/:\s*-Infinity\b/g, ': null');

    // Try to balance braces if truncated
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    if (openBraces > closeBraces) {
      repaired += '}'.repeat(openBraces - closeBraces);
    }

    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;
    if (openBrackets > closeBrackets) {
      repaired += ']'.repeat(openBrackets - closeBrackets);
    }

    return JSON.parse(repaired);
  } catch {
    return null;
  }
}

/**
 * Recover user store state with maximum effort
 *
 * @param state - Possibly corrupted state object
 * @returns Recovered state or null
 */
function recoverUserStoreState(state: any): any {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const recovered: any = {};

  // Recover stats (most critical)
  if (state.stats) {
    try {
      recovered.stats = sanitizeUserStats(state.stats);
    } catch (error) {
      // Create minimal stats if recovery fails
      recovered.stats = {
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
      };
    }
  } else {
    // No stats found - create defaults
    recovered.stats = {
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
    };
  }

  // Recover progress (word-by-word recovery)
  if (state.progress && typeof state.progress === 'object') {
    try {
      recovered.progress = sanitizeProgress(state.progress);
    } catch (error) {
      // Attempt manual recovery word by word
      recovered.progress = {};
      for (const [wordId, wordProgress] of Object.entries(state.progress)) {
        try {
          recovered.progress[wordId] = sanitizeWordProgress(wordProgress as any);
        } catch {
          // Skip this word if it can't be recovered
          continue;
        }
      }
    }
  } else {
    recovered.progress = {};
  }

  // Recover settings with defaults
  recovered.dailyGoal = typeof state.dailyGoal === 'number' ? state.dailyGoal : 20;
  recovered.sessionLength = typeof state.sessionLength === 'number' ? state.sessionLength : 20;
  recovered.todayReviews = typeof state.todayReviews === 'number' ? state.todayReviews : 0;
  recovered.lastReviewDate = typeof state.lastReviewDate === 'string' ? state.lastReviewDate : null;
  recovered.dailyGoalAwardedToday = typeof state.dailyGoalAwardedToday === 'boolean'
    ? state.dailyGoalAwardedToday
    : false;

  // Recover tier/POS/category selections
  recovered.selectedTiers = Array.isArray(state.selectedTiers)
    ? state.selectedTiers.filter((t: any) => typeof t === 'number')
    : [1, 2, 3, 4, 5];
  recovered.selectedPOS = Array.isArray(state.selectedPOS)
    ? state.selectedPOS.filter((p: any) => typeof p === 'string')
    : [];
  recovered.selectedCategories = Array.isArray(state.selectedCategories)
    ? state.selectedCategories.filter((c: any) => typeof c === 'string')
    : [];

  // Recover study history
  if (state.studyHistory && typeof state.studyHistory === 'object') {
    recovered.studyHistory = {};
    for (const [date, record] of Object.entries(state.studyHistory)) {
      if (
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        record &&
        typeof record === 'object'
      ) {
        const r = record as any;
        recovered.studyHistory[date] = {
          reviews: typeof r.reviews === 'number' ? Math.max(0, r.reviews) : 0,
          wordsLearned: typeof r.wordsLearned === 'number' ? Math.max(0, r.wordsLearned) : 0,
        };
      }
    }
  } else {
    recovered.studyHistory = {};
  }

  // Recover session history
  if (Array.isArray(state.sessionHistory)) {
    recovered.sessionHistory = state.sessionHistory.filter(
      (s: any) => s && typeof s === 'object' && typeof s.id === 'string'
    );
  } else {
    recovered.sessionHistory = [];
  }

  // Recover SRS mode
  recovered.srsMode = ['normal', 'accelerated', 'review'].includes(state.srsMode)
    ? state.srsMode
    : 'normal';

  // Recover blind mode
  recovered.blindMode = typeof state.blindMode === 'boolean' ? state.blindMode : false;

  // Add migration version
  recovered.migrationVersion = 2;

  return recovered;
}

/**
 * Detect what data was lost during recovery
 *
 * @param original - Original data
 * @param recovered - Recovered data
 * @returns List of lost data items
 */
function detectLostData(original: any, recovered: any): string[] {
  const lost: string[] = [];

  if (!original || !recovered) return lost;

  // Check progress loss
  if (original.progress && recovered.progress) {
    const originalWords = Object.keys(original.progress).length;
    const recoveredWords = Object.keys(recovered.progress).length;
    if (recoveredWords < originalWords) {
      lost.push(`${originalWords - recoveredWords} word progress entries`);
    }
  }

  // Check study history loss
  if (original.studyHistory && recovered.studyHistory) {
    const originalDays = Object.keys(original.studyHistory).length;
    const recoveredDays = Object.keys(recovered.studyHistory).length;
    if (recoveredDays < originalDays) {
      lost.push(`${originalDays - recoveredDays} study history entries`);
    }
  }

  // Check session history loss
  if (original.sessionHistory && recovered.sessionHistory) {
    const originalSessions = original.sessionHistory.length;
    const recoveredSessions = recovered.sessionHistory.length;
    if (recoveredSessions < originalSessions) {
      lost.push(`${originalSessions - recoveredSessions} session records`);
    }
  }

  // Check achievements loss
  if (original.stats?.achievements && recovered.stats?.achievements) {
    const originalCount = original.stats.achievements.length;
    const recoveredCount = recovered.stats.achievements.length;
    if (recoveredCount < originalCount) {
      lost.push(`${originalCount - recoveredCount} achievements`);
    }
  }

  return lost;
}

/**
 * Create a recovery report for user display
 *
 * @param result - Recovery result
 * @returns Formatted report
 */
export function createRecoveryReport(result: RecoveryResult): string {
  const lines: string[] = [];

  if (result.success) {
    lines.push('✅ Data Recovery Successful');

    if (result.partialRecovery) {
      lines.push('\n⚠️ Partial Recovery - Some data could not be restored');
    } else {
      lines.push('\n✅ Full Recovery - All data restored');
    }

    if (result.warnings.length > 0) {
      lines.push('\nWarnings:');
      result.warnings.forEach((w) => lines.push(`  • ${w}`));
    }

    if (result.lostData && result.lostData.length > 0) {
      lines.push('\nLost Data:');
      result.lostData.forEach((d) => lines.push(`  • ${d}`));
    }
  } else {
    lines.push('❌ Data Recovery Failed');

    if (result.errors.length > 0) {
      lines.push('\nErrors:');
      result.errors.forEach((e) => lines.push(`  • ${e}`));
    }
  }

  return lines.join('\n');
}

/**
 * Export recovered data to downloadable file
 *
 * @param data - Recovered data
 * @param filename - Filename for export
 */
export function exportRecoveredData(data: any, filename: string = 'recovered-data.json'): void {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export recovered data:', error);
  }
}

/**
 * Import and validate recovery data from file
 *
 * @param file - File containing recovery data
 * @returns Promise with recovery result
 */
export function importRecoveryData(file: File): Promise<RecoveryResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = recoverUserStore(content);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
