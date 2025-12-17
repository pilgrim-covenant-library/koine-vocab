import type { WordProgress, UserStats } from '@/types';

/**
 * Data Validation and Sanitization Layer
 * Ensures data integrity when loading from localStorage
 */

/**
 * Sanitize a single WordProgress object
 * Fixes any corrupted or invalid values
 */
export function sanitizeWordProgress(p: WordProgress): WordProgress {
  return {
    ...p,
    wordId: p.wordId || '',
    easeFactor: Math.max(1.3, Math.min(3.0, p.easeFactor || 2.5)),
    interval: Math.max(0, p.interval || 0),
    repetitions: Math.max(0, p.repetitions || 0),
    maxRepetitions: Math.max(0, p.maxRepetitions || p.repetitions || 0),
    timesReviewed: Math.max(0, p.timesReviewed || 0),
    // Ensure timesCorrect never exceeds timesReviewed
    timesCorrect: Math.max(0, Math.min(p.timesCorrect || 0, p.timesReviewed || 0)),
    lastQuality: Math.max(0, Math.min(5, p.lastQuality || 0)),
    // Ensure dates are valid Date objects
    nextReview: p.nextReview instanceof Date ? p.nextReview : new Date(p.nextReview || Date.now()),
    lastReview: p.lastReview ? (p.lastReview instanceof Date ? p.lastReview : new Date(p.lastReview)) : null,
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
export function sanitizeUserStats(stats: UserStats): UserStats {
  return {
    ...stats,
    xp: Math.max(0, stats.xp || 0),
    level: Math.max(1, stats.level || 1),
    streak: Math.max(0, stats.streak || 0),
    longestStreak: Math.max(stats.streak || 0, stats.longestStreak || 0),
    wordsLearned: Math.max(0, stats.wordsLearned || 0),
    wordsInProgress: Math.max(0, stats.wordsInProgress || 0),
    totalReviews: Math.max(0, stats.totalReviews || 0),
    correctReviews: Math.max(0, Math.min(stats.correctReviews || 0, stats.totalReviews || 0)),
    achievements: Array.isArray(stats.achievements) ? stats.achievements : [],
    lastStudyDate: stats.lastStudyDate
      ? (stats.lastStudyDate instanceof Date ? stats.lastStudyDate : new Date(stats.lastStudyDate))
      : null,
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

  // Check for old date format in lastReviewDate
  if (stateObj.lastReviewDate && typeof stateObj.lastReviewDate === 'string') {
    // Old format used toDateString() which produces "Day Mon DD YYYY"
    if (/^[A-Z][a-z]{2}\s/.test(stateObj.lastReviewDate)) {
      return true;
    }
  }

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

/**
 * Migrate old date format to new ISO format
 */
export function migrateLastReviewDate(date: string | null): string | null {
  if (!date) return null;

  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Try to parse and convert
  try {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch {
    // Fall through
  }

  // Can't migrate, return null to reset
  return null;
}
