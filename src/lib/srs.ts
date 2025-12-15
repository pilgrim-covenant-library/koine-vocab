import type { SRSCard, SRSResult, WordProgress } from '@/types';

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo SM-2 algorithm with modern enhancements
 */

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/**
 * Calculate the next review date based on quality rating
 * @param card Current card state
 * @param quality Rating from 0-5 (0=blackout, 5=perfect)
 * @returns Updated card state with next review date
 */
export function calculateNextReview(
  card: SRSCard,
  quality: number
): SRSResult {
  let { easeFactor, interval, repetitions } = card;

  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect - reset to beginning
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure ease factor doesn't go below minimum
  easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor);

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  nextReview.setHours(0, 0, 0, 0); // Start of day

  return { easeFactor, interval, repetitions, nextReview };
}

/**
 * Create initial progress for a new word
 */
export function createInitialProgress(wordId: string): WordProgress {
  const now = new Date();
  return {
    wordId,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReview: now,
    lastReview: null,
    lastQuality: 0,
    timesReviewed: 0,
    timesCorrect: 0,
  };
}

/**
 * Update word progress after a review
 */
export function updateWordProgress(
  progress: WordProgress,
  quality: number
): WordProgress {
  const result = calculateNextReview(
    {
      easeFactor: progress.easeFactor,
      interval: progress.interval,
      repetitions: progress.repetitions,
    },
    quality
  );

  return {
    ...progress,
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    nextReview: result.nextReview,
    lastReview: new Date(),
    lastQuality: quality,
    timesReviewed: progress.timesReviewed + 1,
    timesCorrect: progress.timesCorrect + (quality >= 3 ? 1 : 0),
  };
}

/**
 * Check if a word is due for review
 */
export function isDue(progress: WordProgress): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return progress.nextReview <= now;
}

/**
 * Get all words due for review, sorted by priority
 * Words that are more overdue come first
 */
export function getDueWords(progressList: WordProgress[]): WordProgress[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return progressList
    .filter(p => isDue(p))
    .sort((a, b) => {
      // Sort by how overdue they are (most overdue first)
      const overdueA = now.getTime() - a.nextReview.getTime();
      const overdueB = now.getTime() - b.nextReview.getTime();
      return overdueB - overdueA;
    });
}

/**
 * Calculate mastery percentage for a word
 * Based on repetitions and ease factor
 */
export function calculateMastery(progress: WordProgress): number {
  if (progress.timesReviewed === 0) return 0;

  // Weight factors
  const repetitionWeight = Math.min(progress.repetitions / 5, 1) * 0.4;
  const accuracyWeight = (progress.timesCorrect / progress.timesReviewed) * 0.4;
  const easeWeight = Math.min((progress.easeFactor - MIN_EASE_FACTOR) / (3.0 - MIN_EASE_FACTOR), 1) * 0.2;

  return Math.round((repetitionWeight + accuracyWeight + easeWeight) * 100);
}

/**
 * Convert quality button press to numeric quality
 */
export function buttonToQuality(button: 'again' | 'hard' | 'good' | 'easy'): number {
  switch (button) {
    case 'again': return 1;
    case 'hard': return 3;
    case 'good': return 4;
    case 'easy': return 5;
  }
}

/**
 * Get estimated next review interval for each button
 */
export function getButtonIntervals(progress: WordProgress): Record<string, string> {
  const buttons = ['again', 'hard', 'good', 'easy'] as const;
  const intervals: Record<string, string> = {};

  for (const button of buttons) {
    const quality = buttonToQuality(button);
    const result = calculateNextReview(
      {
        easeFactor: progress.easeFactor,
        interval: progress.interval,
        repetitions: progress.repetitions,
      },
      quality
    );
    intervals[button] = formatInterval(result.interval);
  }

  return intervals;
}

/**
 * Format interval as human-readable string
 */
function formatInterval(days: number): string {
  if (days === 0) return '<1d';
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}
