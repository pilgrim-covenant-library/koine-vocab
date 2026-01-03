import type { SRSCard, SRSResult, WordProgress } from '@/types';

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo SM-2 algorithm with modern enhancements
 *
 * Includes a "learning phase" for new cards with sub-day intervals:
 * - Learning steps: 1 minute → 10 minutes → 1 hour → 4 hours
 * - After graduating from learning phase, cards enter standard SM-2 with 1-day intervals
 */

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

// Learning phase intervals in minutes
// These short intervals help cement new words into short-term memory
const LEARNING_STEPS_MINUTES = [1, 10, 60, 240]; // 1m, 10m, 1hr, 4hr

/**
 * Check if a card is in learning phase
 */
export function isInLearningPhase(card: SRSCard): boolean {
  return card.learningStep !== undefined && card.learningStep < LEARNING_STEPS_MINUTES.length;
}

/**
 * Calculate the next review date based on quality rating
 * @param card Current card state
 * @param quality Rating from 0-5 (0=blackout, 5=perfect)
 * @param intervalModifier Multiplier for intervals (default 1.0)
 * @returns Updated card state with next review date
 */
export function calculateNextReview(
  card: SRSCard,
  quality: number,
  intervalModifier: number = 1.0
): SRSResult {
  let { easeFactor, interval, repetitions, learningStep } = card;

  // Handle NaN quality - treat as incorrect response (quality 1)
  if (isNaN(quality) || quality === null || quality === undefined) {
    quality = 1;
  }

  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  const nextReview = new Date();

  // Check if card is in learning phase
  if (isInLearningPhase(card)) {
    if (quality >= 3) {
      // Correct during learning - advance to next step
      learningStep = (learningStep ?? 0) + 1;

      if (learningStep >= LEARNING_STEPS_MINUTES.length) {
        // Graduated from learning phase - enter standard SM-2
        learningStep = undefined;
        repetitions = 1;
        interval = Math.max(1, Math.round(1 * intervalModifier)); // 1 day
        nextReview.setDate(nextReview.getDate() + interval);
        nextReview.setHours(0, 0, 0, 0);
      } else {
        // Still in learning - set next review in minutes
        const minutesUntilNext = LEARNING_STEPS_MINUTES[learningStep];
        nextReview.setMinutes(nextReview.getMinutes() + minutesUntilNext);
        interval = 0; // Signal that this is sub-day interval
      }
    } else {
      // Incorrect during learning - reset to first learning step
      learningStep = 0;
      const minutesUntilNext = LEARNING_STEPS_MINUTES[0];
      nextReview.setMinutes(nextReview.getMinutes() + minutesUntilNext);
      interval = 0;
    }
  } else {
    // Standard SM-2 algorithm for graduated cards
    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = Math.max(1, Math.round(1 * intervalModifier));
      } else if (repetitions === 1) {
        interval = Math.max(1, Math.round(6 * intervalModifier));
      } else {
        interval = Math.max(1, Math.round(interval * easeFactor * intervalModifier));
      }
      repetitions += 1;
      nextReview.setDate(nextReview.getDate() + interval);
      nextReview.setHours(0, 0, 0, 0); // Start of day
    } else {
      // Incorrect - reset to learning phase
      learningStep = 0;
      repetitions = 0;
      interval = 0;
      const minutesUntilNext = LEARNING_STEPS_MINUTES[0];
      nextReview.setMinutes(nextReview.getMinutes() + minutesUntilNext);
    }
  }

  // Update ease factor using SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure ease factor stays within bounds (1.3 to 3.0)
  const MAX_EASE_FACTOR = 3.0;
  easeFactor = Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, easeFactor));

  return { easeFactor, interval, repetitions, learningStep, nextReview };
}

/**
 * Create initial progress for a new word
 * New words start in learning phase at step 0
 */
export function createInitialProgress(wordId: string): WordProgress {
  const now = new Date();
  return {
    wordId,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    maxRepetitions: 0,
    learningStep: 0, // Start in learning phase
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
  quality: number,
  intervalModifier: number = 1.0
): WordProgress {
  const result = calculateNextReview(
    {
      easeFactor: progress.easeFactor,
      interval: progress.interval,
      repetitions: progress.repetitions,
      learningStep: progress.learningStep,
    },
    quality,
    intervalModifier
  );

  return {
    ...progress,
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    learningStep: result.learningStep,
    maxRepetitions: Math.max(progress.maxRepetitions || 0, result.repetitions),
    nextReview: result.nextReview,
    lastReview: new Date(),
    lastQuality: quality,
    timesReviewed: progress.timesReviewed + 1,
    timesCorrect: progress.timesCorrect + (quality >= 3 ? 1 : 0),
  };
}

/**
 * Check if a word is due for review
 * For learning phase cards (interval=0), compare exact time
 * For graduated cards, compare dates only
 */
export function isDue(progress: WordProgress): boolean {
  const now = new Date();

  // Learning phase cards have interval=0 and need sub-day precision
  if (progress.interval === 0 || progress.learningStep !== undefined) {
    return progress.nextReview <= now;
  }

  // Graduated cards compare at day level (midnight comparison)
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);

  const reviewDate = new Date(progress.nextReview);
  reviewDate.setHours(0, 0, 0, 0);

  return reviewDate <= todayMidnight;
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
export function getButtonIntervals(
  progress: WordProgress,
  intervalModifier: number = 1.0
): Record<string, string> {
  const buttons = ['again', 'hard', 'good', 'easy'] as const;
  const intervals: Record<string, string> = {};

  for (const button of buttons) {
    const quality = buttonToQuality(button);
    const result = calculateNextReview(
      {
        easeFactor: progress.easeFactor,
        interval: progress.interval,
        repetitions: progress.repetitions,
        learningStep: progress.learningStep,
      },
      quality,
      intervalModifier
    );

    // For learning phase cards, show time until next review
    if (result.learningStep !== undefined) {
      const minutesUntilNext = LEARNING_STEPS_MINUTES[result.learningStep];
      intervals[button] = formatMinutes(minutesUntilNext);
    } else {
      intervals[button] = formatInterval(result.interval);
    }
  }

  return intervals;
}

/**
 * Format minutes as human-readable string
 */
function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}

/**
 * Format interval (in days) as human-readable string
 */
function formatInterval(days: number): string {
  if (days === 0) return '<1m'; // Learning phase
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}
