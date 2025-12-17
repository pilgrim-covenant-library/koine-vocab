import { LEVEL_THRESHOLDS, XP_REWARDS, type UserStats } from '@/types';

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    // For levels beyond our threshold table, use exponential growth
    const lastThreshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const levelsAbove = currentLevel - LEVEL_THRESHOLDS.length;
    return Math.round(lastThreshold * Math.pow(1.1, levelsAbove + 1));
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

/**
 * Get progress within current level (0-100%)
 */
export function getLevelProgress(xp: number): number {
  const level = calculateLevel(xp);
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = getXPForNextLevel(level);

  const xpIntoLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;

  return Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));
}

/**
 * Award XP for an action
 */
export function awardXP(
  stats: UserStats,
  action: keyof typeof XP_REWARDS,
  multiplier: number = 1
): { newStats: UserStats; xpGained: number; leveledUp: boolean } {
  const baseXP = XP_REWARDS[action];
  const xpGained = Math.round(baseXP * multiplier);
  const oldLevel = stats.level;
  const newXP = stats.xp + xpGained;
  const newLevel = calculateLevel(newXP);

  return {
    newStats: {
      ...stats,
      xp: newXP,
      level: newLevel,
    },
    xpGained,
    leveledUp: newLevel > oldLevel,
  };
}

/**
 * Check and update streak
 */
export function updateStreak(stats: UserStats): UserStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!stats.lastStudyDate) {
    // First study session
    return {
      ...stats,
      streak: 1,
      longestStreak: Math.max(1, stats.longestStreak),
      lastStudyDate: today,
    };
  }

  const lastStudy = new Date(stats.lastStudyDate);
  lastStudy.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    // Already studied today
    return stats;
  } else if (daysDiff === 1) {
    // Consecutive day - increase streak
    const newStreak = stats.streak + 1;
    return {
      ...stats,
      streak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastStudyDate: today,
    };
  } else {
    // Streak broken - reset to 1
    return {
      ...stats,
      streak: 1,
      lastStudyDate: today,
    };
  }
}

/**
 * Calculate streak bonus multiplier
 * Higher streaks give bonus XP, capped at 2x
 */
export function getStreakMultiplier(streak: number): number {
  if (streak <= 1) return 1;
  if (streak <= 7) return 1 + (streak - 1) * 0.05; // 5% per day up to 30% at 7 days
  if (streak <= 30) return 1.3 + (streak - 7) * 0.02; // 2% per day up to 76% at 30 days
  // 1% per day thereafter, hard capped at 2x
  return Math.min(2.0, 1.76 + (streak - 30) * 0.01);
}

/**
 * Get title for level
 */
export function getLevelTitle(level: number): string {
  if (level <= 5) return 'Novice';
  if (level <= 10) return 'Student';
  if (level <= 15) return 'Apprentice';
  if (level <= 20) return 'Scholar';
  if (level <= 25) return 'Linguist';
  if (level <= 30) return 'Expert';
  if (level <= 40) return 'Master';
  if (level <= 50) return 'Sage';
  return 'Grandmaster';
}

/**
 * Create initial user stats
 */
export function createInitialStats(): UserStats {
  return {
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
