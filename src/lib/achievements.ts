import type { Achievement, UserStats } from '@/types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Learn your first 10 words',
    icon: '👣',
    xpBonus: 50,
    condition: { type: 'words_learned', count: 10 },
  },
  {
    id: 'vocabulary-builder',
    name: 'Vocabulary Builder',
    description: 'Learn 100 words',
    icon: '📚',
    xpBonus: 200,
    condition: { type: 'words_learned', count: 100 },
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Learn 500 words',
    icon: '🎓',
    xpBonus: 500,
    condition: { type: 'words_learned', count: 500 },
  },
  {
    id: 'master',
    name: 'NT Master',
    description: 'Learn 1000 words',
    icon: '👑',
    xpBonus: 1000,
    condition: { type: 'words_learned', count: 1000 },
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpBonus: 150,
    condition: { type: 'streak_days', count: 7 },
  },
  {
    id: 'month-master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🌟',
    xpBonus: 500,
    condition: { type: 'streak_days', count: 30 },
  },
  {
    id: 'perfect-session',
    name: 'Perfect Session',
    description: 'Complete a session with 100% accuracy',
    icon: '💯',
    xpBonus: 100,
    condition: { type: 'perfect_session' },
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Complete 100 reviews',
    icon: '💪',
    xpBonus: 75,
    condition: { type: 'reviews_count', count: 100 },
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Complete 500 reviews',
    icon: '🏆',
    xpBonus: 200,
    condition: { type: 'reviews_count', count: 500 },
  },
  {
    id: 'tier1-conqueror',
    name: 'Tier 1 Conqueror',
    description: 'Master all Tier 1 (essential) words',
    icon: '⭐',
    xpBonus: 300,
    condition: { type: 'tier_mastered', tier: 1 },
  },
  {
    id: 'tier2-conqueror',
    name: 'Tier 2 Conqueror',
    description: 'Master all Tier 2 (high frequency) words',
    icon: '🌟',
    xpBonus: 400,
    condition: { type: 'tier_mastered', tier: 2 },
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete 50 reviews in 5 minutes',
    icon: '⚡',
    xpBonus: 75,
    condition: { type: 'speed_demon', reviews: 50, minutes: 5 },
  },
];

/**
 * Check which achievements have been earned based on current stats
 */
export function checkAchievements(
  stats: UserStats,
  additionalData?: {
    tierProgress?: Record<number, { learned: number; total: number }>;
    sessionStats?: { reviews: number; duration: number; isPerfect: boolean };
  }
): Achievement[] {
  const earnedAchievements: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip already unlocked achievements
    if (stats.achievements.includes(achievement.id)) continue;

    const { condition } = achievement;
    let earned = false;

    switch (condition.type) {
      case 'words_learned':
        earned = stats.wordsLearned >= condition.count;
        break;

      case 'streak_days':
        earned = stats.streak >= condition.count;
        break;

      case 'perfect_session':
        earned = additionalData?.sessionStats?.isPerfect ?? false;
        break;

      case 'reviews_count':
        earned = stats.totalReviews >= condition.count;
        break;

      case 'tier_mastered':
        if (additionalData?.tierProgress) {
          const tierData = additionalData.tierProgress[condition.tier];
          earned = tierData ? tierData.learned >= tierData.total : false;
        }
        break;

      case 'speed_demon':
        if (additionalData?.sessionStats) {
          const { reviews, duration } = additionalData.sessionStats;
          const minutes = duration / (1000 * 60);
          earned = reviews >= condition.reviews && minutes <= condition.minutes;
        }
        break;
    }

    if (earned) {
      earnedAchievements.push(achievement);
    }
  }

  return earnedAchievements;
}

/**
 * Get achievement by ID
 */
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get all achievements with unlock status
 */
export function getAchievementsWithStatus(
  unlockedIds: string[]
): (Achievement & { unlocked: boolean })[] {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: unlockedIds.includes(achievement.id),
  }));
}

/**
 * Calculate total XP bonus from achievements
 */
export function calculateAchievementXP(unlockedIds: string[]): number {
  return ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id)).reduce(
    (sum, a) => sum + a.xpBonus,
    0
  );
}
