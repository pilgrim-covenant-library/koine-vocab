// Daily Quest System
export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number; // XP reward
  type: 'reviews' | 'accuracy' | 'streak' | 'words_learned' | 'perfect_session' | 'time_spent';
  icon: string;
}

export interface QuestProgress {
  questId: string;
  current: number;
  completed: boolean;
  claimedAt: string | null;
}

// Available daily quest templates
export const QUEST_TEMPLATES: Quest[] = [
  {
    id: 'reviews_10',
    title: 'Warm Up',
    description: 'Complete 10 reviews',
    target: 10,
    reward: 15,
    type: 'reviews',
    icon: 'book',
  },
  {
    id: 'reviews_25',
    title: 'Study Session',
    description: 'Complete 25 reviews',
    target: 25,
    reward: 30,
    type: 'reviews',
    icon: 'book-open',
  },
  {
    id: 'reviews_50',
    title: 'Marathon',
    description: 'Complete 50 reviews',
    target: 50,
    reward: 60,
    type: 'reviews',
    icon: 'zap',
  },
  {
    id: 'accuracy_80',
    title: 'Sharp Mind',
    description: 'Achieve 80% accuracy in a session',
    target: 80,
    reward: 25,
    type: 'accuracy',
    icon: 'target',
  },
  {
    id: 'accuracy_95',
    title: 'Near Perfect',
    description: 'Achieve 95% accuracy in a session',
    target: 95,
    reward: 50,
    type: 'accuracy',
    icon: 'award',
  },
  {
    id: 'perfect_session',
    title: 'Flawless',
    description: 'Complete a session with 100% accuracy',
    target: 1,
    reward: 40,
    type: 'perfect_session',
    icon: 'star',
  },
  {
    id: 'streak_3',
    title: 'Consistent',
    description: 'Maintain a 3-day streak',
    target: 3,
    reward: 35,
    type: 'streak',
    icon: 'flame',
  },
  {
    id: 'words_5',
    title: 'New Knowledge',
    description: 'Learn 5 new words',
    target: 5,
    reward: 40,
    type: 'words_learned',
    icon: 'graduation-cap',
  },
  {
    id: 'words_10',
    title: 'Vocabulary Builder',
    description: 'Learn 10 new words',
    target: 10,
    reward: 75,
    type: 'words_learned',
    icon: 'library',
  },
];

// Generate daily quests based on date (deterministic)
export function getDailyQuests(dateStr: string): Quest[] {
  // Use date as seed for consistent daily quests
  // Create a better hash from the date string to avoid collisions
  const seed = new Date(dateStr).getTime() / 86400000; // Days since epoch

  // Always include a review quest, an accuracy quest, and one random quest
  const reviewQuests = QUEST_TEMPLATES.filter(q => q.type === 'reviews');
  const accuracyQuests = QUEST_TEMPLATES.filter(q => q.type === 'accuracy');
  const otherQuests = QUEST_TEMPLATES.filter(q => q.type !== 'reviews' && q.type !== 'accuracy');

  const selectedReviewQuest = reviewQuests[seed % reviewQuests.length];
  const selectedAccuracyQuest = accuracyQuests[(seed + 1) % accuracyQuests.length];
  const selectedOtherQuest = otherQuests[(seed + 2) % otherQuests.length];

  return [selectedReviewQuest, selectedAccuracyQuest, selectedOtherQuest];
}

// Get today's date string
export function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}
