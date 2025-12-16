import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStats, WordProgress } from '@/types';
import { createInitialStats, updateStreak, awardXP, calculateLevel } from '@/lib/xp';
import { createInitialProgress, updateWordProgress, isDue } from '@/lib/srs';

interface UserState {
  // User stats
  stats: UserStats;
  // Word progress keyed by word ID
  progress: Record<string, WordProgress>;
  // Daily goal (number of reviews)
  dailyGoal: number;
  // Session length (cards per session)
  sessionLength: number;
  // Today's review count
  todayReviews: number;
  // Last review date (for resetting daily count)
  lastReviewDate: string | null;

  // Actions
  initializeWord: (wordId: string) => void;
  reviewWord: (wordId: string, quality: number) => { xpGained: number; leveledUp: boolean };
  getWordProgress: (wordId: string) => WordProgress | null;
  getDueWords: () => WordProgress[];
  getLearnedWordsCount: () => number;
  getInProgressWordsCount: () => number;
  setDailyGoal: (goal: number) => void;
  setSessionLength: (length: number) => void;
  resetDailyCount: () => void;
  unlockAchievement: (achievementId: string) => void;
  addXP: (amount: number) => { leveledUp: boolean };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      stats: createInitialStats(),
      progress: {},
      dailyGoal: 20,
      sessionLength: 20,
      todayReviews: 0,
      lastReviewDate: null,

      initializeWord: (wordId: string) => {
        const { progress } = get();
        if (!progress[wordId]) {
          const initialProgress = createInitialProgress(wordId);
          set({
            progress: {
              ...progress,
              [wordId]: initialProgress,
            },
          });
        }
      },

      reviewWord: (wordId: string, quality: number) => {
        const state = get();
        let { stats, progress, todayReviews, lastReviewDate } = state;

        // Check if we need to reset daily count
        const today = new Date().toDateString();
        if (lastReviewDate !== today) {
          todayReviews = 0;
          lastReviewDate = today;
        }

        // Get or create word progress
        let wordProgress = progress[wordId];
        const isNewWord = !wordProgress;

        if (!wordProgress) {
          wordProgress = createInitialProgress(wordId);
        }

        // Update word progress with SRS
        const updatedProgress = updateWordProgress(wordProgress, quality);

        // Update streak
        stats = updateStreak(stats);

        // Award XP
        const isCorrect = quality >= 3;
        let xpResult = { newStats: stats, xpGained: 0, leveledUp: false };

        if (isCorrect) {
          if (isNewWord) {
            xpResult = awardXP(stats, 'newWordLearned');
          } else {
            xpResult = awardXP(stats, 'correctFlashcard');
          }
        }

        // Update review counts
        const newTodayReviews = todayReviews + 1;

        // Check if daily goal met
        if (newTodayReviews === state.dailyGoal && todayReviews < state.dailyGoal) {
          xpResult = awardXP(xpResult.newStats, 'dailyGoalMet');
        }

        // Update stats
        const newStats: UserStats = {
          ...xpResult.newStats,
          totalReviews: stats.totalReviews + 1,
          correctReviews: stats.correctReviews + (isCorrect ? 1 : 0),
          wordsLearned: isNewWord && isCorrect ? stats.wordsLearned + 1 : stats.wordsLearned,
          wordsInProgress: Object.values({
            ...progress,
            [wordId]: updatedProgress,
          }).filter((p) => p.repetitions > 0 && p.repetitions < 5).length,
        };

        set({
          stats: newStats,
          progress: {
            ...progress,
            [wordId]: updatedProgress,
          },
          todayReviews: newTodayReviews,
          lastReviewDate,
        });

        return {
          xpGained: xpResult.xpGained,
          leveledUp: xpResult.leveledUp,
        };
      },

      getWordProgress: (wordId: string) => {
        return get().progress[wordId] || null;
      },

      getDueWords: () => {
        const { progress } = get();
        return Object.values(progress).filter(isDue);
      },

      getLearnedWordsCount: () => {
        const { progress } = get();
        // Words with at least 5 successful repetitions are considered "learned"
        return Object.values(progress).filter((p) => p.repetitions >= 5).length;
      },

      getInProgressWordsCount: () => {
        const { progress } = get();
        return Object.values(progress).filter(
          (p) => p.repetitions > 0 && p.repetitions < 5
        ).length;
      },

      setDailyGoal: (goal: number) => {
        set({ dailyGoal: Math.max(5, Math.min(100, goal)) });
      },

      setSessionLength: (length: number) => {
        set({ sessionLength: Math.max(5, Math.min(50, length)) });
      },

      resetDailyCount: () => {
        set({ todayReviews: 0 });
      },

      unlockAchievement: (achievementId: string) => {
        const { stats } = get();
        if (!stats.achievements.includes(achievementId)) {
          set({
            stats: {
              ...stats,
              achievements: [...stats.achievements, achievementId],
            },
          });
        }
      },

      addXP: (amount: number) => {
        const { stats } = get();
        const newXP = stats.xp + amount;
        const newLevel = calculateLevel(newXP);
        const leveledUp = newLevel > stats.level;

        set({
          stats: {
            ...stats,
            xp: newXP,
            level: newLevel,
          },
        });

        return { leveledUp };
      },
    }),
    {
      name: 'koine-user-store',
      // Custom serialization for Date objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert date strings back to Date objects
          if (data.state?.progress) {
            Object.values(data.state.progress as Record<string, WordProgress>).forEach((p) => {
              if (p.nextReview) p.nextReview = new Date(p.nextReview);
              if (p.lastReview) p.lastReview = new Date(p.lastReview);
            });
          }
          if (data.state?.stats?.lastStudyDate) {
            data.state.stats.lastStudyDate = new Date(data.state.stats.lastStudyDate);
          }
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
