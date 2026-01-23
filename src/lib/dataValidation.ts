import type { WordProgress, UserStats } from '@/types';

/**
 * Enhanced Data Validation and Sanitization Layer
 * Ensures data integrity when loading from localStorage
 *
 * Features:
 * - Comprehensive type checking
 * - NaN/Infinity detection
 * - Schema validation
 * - Automatic sanitization
 */

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if value is a valid number (not NaN or Infinity)
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is a valid positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value >= 0;
}

/**
 * Check if value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if value is a valid ISO date string
 */
export function isISODateString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  return isoRegex.test(value);
}

/**
 * Type guard for WordProgress
 */
export function isWordProgress(value: unknown): value is WordProgress {
  if (!value || typeof value !== 'object') return false;

  const p = value as Partial<WordProgress>;

  return (
    typeof p.wordId === 'string' &&
    isValidNumber(p.easeFactor) &&
    isPositiveNumber(p.interval) &&
    isPositiveNumber(p.repetitions) &&
    isPositiveNumber(p.timesReviewed) &&
    isPositiveNumber(p.timesCorrect) &&
    (p.nextReview instanceof Date || typeof p.nextReview === 'string')
  );
}

/**
 * Type guard for UserStats
 */
export function isUserStats(value: unknown): value is UserStats {
  if (!value || typeof value !== 'object') return false;

  const s = value as Partial<UserStats>;

  return (
    isPositiveNumber(s.xp) &&
    isPositiveNumber(s.level) &&
    isPositiveNumber(s.streak) &&
    isPositiveNumber(s.longestStreak) &&
    isPositiveNumber(s.wordsLearned) &&
    isPositiveNumber(s.wordsInProgress) &&
    isPositiveNumber(s.totalReviews) &&
    isPositiveNumber(s.correctReviews) &&
    Array.isArray(s.achievements)
  );
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate and clean numeric value
 *
 * @param value - Value to validate
 * @param defaultValue - Default if invalid
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 */
export function sanitizeNumber(
  value: unknown,
  defaultValue: number,
  min: number = -Infinity,
  max: number = Infinity
): number {
  if (!isValidNumber(value)) {
    return defaultValue;
  }

  return Math.max(min, Math.min(max, value));
}

/**
 * Validate and clean date value
 *
 * @param value - Value to validate
 * @param defaultValue - Default if invalid
 */
export function sanitizeDate(
  value: unknown,
  defaultValue: Date | null = null
): Date | null {
  if (value instanceof Date) {
    return isValidDate(value) ? value : defaultValue;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return isValidDate(parsed) ? parsed : defaultValue;
  }

  return defaultValue;
}

/**
 * Validate array and filter out invalid elements
 *
 * @param value - Value to validate
 * @param validator - Function to validate each element
 * @param defaultValue - Default if not an array
 */
export function sanitizeArray<T>(
  value: unknown,
  validator: (item: unknown) => item is T,
  defaultValue: T[] = []
): T[] {
  if (!Array.isArray(value)) {
    return defaultValue;
  }

  return value.filter(validator);
}

/**
 * Detect problematic values in data
 *
 * @param data - Data to check
 * @returns Array of issues found
 */
export function detectDataIssues(data: unknown): string[] {
  const issues: string[] = [];

  function checkValue(value: unknown, path: string): void {
    if (value === null || value === undefined) return;

    if (typeof value === 'number') {
      if (isNaN(value)) {
        issues.push(`NaN found at ${path}`);
      }
      if (!isFinite(value)) {
        issues.push(`Infinity found at ${path}`);
      }
    }

    if (typeof value === 'object' && value !== null) {
      if (value instanceof Date && isNaN(value.getTime())) {
        issues.push(`Invalid Date at ${path}`);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          checkValue(item, `${path}[${index}]`);
        });
      } else {
        Object.entries(value).forEach(([key, val]) => {
          checkValue(val, path ? `${path}.${key}` : key);
        });
      }
    }
  }

  checkValue(data, '');
  return issues;
}

// =============================================================================
// Enhanced Sanitization Functions
// =============================================================================

/**
 * Sanitize a single WordProgress object
 * Fixes any corrupted or invalid values
 */
export function sanitizeWordProgress(p: WordProgress | Partial<WordProgress>): WordProgress {
  // Extract values with comprehensive validation
  const wordId = typeof p.wordId === 'string' ? p.wordId : '';
  const easeFactor = sanitizeNumber(p.easeFactor, 2.5, 1.3, 3.0);
  const interval = sanitizeNumber(p.interval, 0, 0);
  const repetitions = sanitizeNumber(p.repetitions, 0, 0);
  const timesReviewed = sanitizeNumber(p.timesReviewed, 0, 0);
  const timesCorrect = sanitizeNumber(p.timesCorrect, 0, 0, timesReviewed);
  const maxRepetitions = sanitizeNumber(
    p.maxRepetitions,
    Math.max(repetitions, 0),
    0
  );
  const lastQuality = sanitizeNumber(p.lastQuality, 0, 0, 5);

  // Sanitize dates
  const nextReview = sanitizeDate(p.nextReview, new Date()) as Date;
  const lastReview = sanitizeDate(p.lastReview, null);

  return {
    wordId,
    easeFactor,
    interval,
    repetitions,
    maxRepetitions,
    timesReviewed,
    timesCorrect,
    lastQuality,
    nextReview,
    lastReview,
  };
}

/**
 * Sanitize all progress records
 */
export function sanitizeProgress(progress: Record<string, WordProgress>): Record<string, WordProgress> {
  const sanitized: Record<string, WordProgress> = {};

  for (const [wordId, p] of Object.entries(progress)) {
    // Skip entries with invalid wordIds
    if (!wordId || typeof wordId !== 'string') continue;

    sanitized[wordId] = sanitizeWordProgress(p);
  }

  return sanitized;
}

/**
 * Sanitize UserStats object
 */
export function sanitizeUserStats(stats: UserStats | Partial<UserStats>): UserStats {
  const xp = sanitizeNumber(stats.xp, 0, 0);
  const level = sanitizeNumber(stats.level, 1, 1);
  const streak = sanitizeNumber(stats.streak, 0, 0);
  const longestStreak = sanitizeNumber(stats.longestStreak, streak, streak);
  const wordsLearned = sanitizeNumber(stats.wordsLearned, 0, 0);
  const wordsInProgress = sanitizeNumber(stats.wordsInProgress, 0, 0);
  const totalReviews = sanitizeNumber(stats.totalReviews, 0, 0);
  const correctReviews = sanitizeNumber(stats.correctReviews, 0, 0, totalReviews);
  const lastStudyDate = sanitizeDate(stats.lastStudyDate, null);

  // Sanitize achievements array
  const achievements = sanitizeArray(
    stats.achievements,
    (item): item is string => typeof item === 'string',
    []
  );

  return {
    xp,
    level,
    streak,
    longestStreak,
    wordsLearned,
    wordsInProgress,
    totalReviews,
    correctReviews,
    achievements,
    lastStudyDate,
  };
}

/**
 * Sanitize study history records
 */
export function sanitizeStudyHistory(
  history: Record<string, { reviews: number; wordsLearned: number }>
): Record<string, { reviews: number; wordsLearned: number }> {
  const sanitized: Record<string, { reviews: number; wordsLearned: number }> = {};

  for (const [date, record] of Object.entries(history)) {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    sanitized[date] = {
      reviews: Math.max(0, record.reviews || 0),
      wordsLearned: Math.max(0, record.wordsLearned || 0),
    };
  }

  return sanitized;
}

/**
 * Check if data needs migration or repair
 */
export function needsDataMigration(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;

  const state = (data as { state?: unknown }).state;
  if (!state || typeof state !== 'object') return false;

  const stateObj = state as Record<string, unknown>;

  // Check for corrupted progress entries
  const progress = stateObj.progress as Record<string, WordProgress> | undefined;
  if (progress) {
    for (const p of Object.values(progress)) {
      if (p.timesCorrect > p.timesReviewed) return true;
      if (p.easeFactor < 1.3 || p.easeFactor > 3.0) return true;
      if (p.repetitions < 0 || p.interval < 0) return true;
    }
  }

  return false;
}

// =============================================================================
// Comprehensive Data Validation
// =============================================================================

/**
 * Validate entire user store state
 *
 * @param data - Raw data from localStorage
 * @returns Validation result with errors
 */
export function validateUserStoreState(data: unknown): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check basic structure
  if (!data || typeof data !== 'object') {
    errors.push('Data is not an object');
    return { isValid: false, errors, warnings };
  }

  const state = (data as any).state;
  if (!state || typeof state !== 'object') {
    errors.push('Missing state object');
    return { isValid: false, errors, warnings };
  }

  // Check for NaN/Infinity issues
  const dataIssues = detectDataIssues(state);
  if (dataIssues.length > 0) {
    warnings.push(...dataIssues);
  }

  // Validate stats
  if (!isUserStats(state.stats)) {
    errors.push('Invalid or missing stats object');
  }

  // Validate progress
  if (state.progress && typeof state.progress === 'object') {
    for (const [wordId, wordProgress] of Object.entries(state.progress)) {
      if (!isWordProgress(wordProgress)) {
        warnings.push(`Invalid word progress for ${wordId}`);
      }
    }
  } else {
    errors.push('Invalid or missing progress object');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Deep clone and sanitize data structure
 *
 * @param data - Data to clone and sanitize
 * @returns Sanitized deep copy
 */
export function deepSanitize<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'number') {
    if (isNaN(data)) return 0 as any;
    if (!isFinite(data)) return 0 as any;
    return data;
  }

  if (data instanceof Date) {
    return (isValidDate(data) ? new Date(data) : new Date()) as any;
  }

  if (Array.isArray(data)) {
    return data.map(deepSanitize) as any;
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = deepSanitize(value);
    }
    return sanitized;
  }

  return data;
}
