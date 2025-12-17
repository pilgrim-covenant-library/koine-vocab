import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Quest, QuestProgress, getDailyQuests, getTodayDateStr } from '@/lib/quests';

interface QuestState {
  // The date for which current quests are generated
  questDate: string | null;
  // Progress for current quests
  questProgress: Record<string, QuestProgress>;
  // Session stats for accuracy tracking
  lastSessionAccuracy: number | null;

  // Actions
  initializeQuests: () => Quest[];
  updateQuestProgress: (
    questId: string,
    amount: number,
    replace?: boolean
  ) => void;
  markQuestComplete: (questId: string) => number; // Returns XP reward
  isQuestCompleted: (questId: string) => boolean;
  isQuestClaimed: (questId: string) => boolean;
  getQuestProgress: (questId: string) => QuestProgress | null;
  getCurrentQuests: () => Quest[];
  recordSessionAccuracy: (accuracy: number) => void;
  recordReviewCount: (count: number) => void;
  recordPerfectSession: () => void;
  recordWordsLearned: (count: number) => void;
  getTotalUnclaimedRewards: () => number;
  claimAllRewards: () => number; // Returns total XP claimed
}

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      questDate: null,
      questProgress: {},
      lastSessionAccuracy: null,

      initializeQuests: () => {
        const today = getTodayDateStr();
        const currentDate = get().questDate;

        // If it's a new day, reset quests
        if (currentDate !== today) {
          const quests = getDailyQuests(today);
          const initialProgress: Record<string, QuestProgress> = {};

          quests.forEach((quest) => {
            initialProgress[quest.id] = {
              questId: quest.id,
              current: 0,
              completed: false,
              claimedAt: null,
            };
          });

          set({
            questDate: today,
            questProgress: initialProgress,
            lastSessionAccuracy: null,
          });

          return quests;
        }

        return getDailyQuests(today);
      },

      updateQuestProgress: (questId, amount, replace = false) => {
        const { questProgress } = get();
        const progress = questProgress[questId];
        if (!progress || progress.claimedAt) return;

        const quests = getDailyQuests(get().questDate || getTodayDateStr());
        const quest = quests.find((q) => q.id === questId);
        if (!quest) return;

        const newCurrent = replace ? amount : progress.current + amount;
        const completed = newCurrent >= quest.target;

        set({
          questProgress: {
            ...questProgress,
            [questId]: {
              ...progress,
              current: newCurrent,
              completed,
            },
          },
        });
      },

      markQuestComplete: (questId) => {
        const { questProgress } = get();
        const progress = questProgress[questId];
        if (!progress || progress.claimedAt) return 0;

        const quests = getDailyQuests(get().questDate || getTodayDateStr());
        const quest = quests.find((q) => q.id === questId);
        if (!quest || !progress.completed) return 0;

        set({
          questProgress: {
            ...questProgress,
            [questId]: {
              ...progress,
              claimedAt: new Date().toISOString(),
            },
          },
        });

        return quest.reward;
      },

      isQuestCompleted: (questId) => {
        const progress = get().questProgress[questId];
        return progress?.completed || false;
      },

      isQuestClaimed: (questId) => {
        const progress = get().questProgress[questId];
        return progress?.claimedAt !== null;
      },

      getQuestProgress: (questId) => {
        return get().questProgress[questId] || null;
      },

      getCurrentQuests: () => {
        const today = getTodayDateStr();
        const currentDate = get().questDate;

        if (currentDate !== today) {
          return get().initializeQuests();
        }

        return getDailyQuests(today);
      },

      recordSessionAccuracy: (accuracy) => {
        const quests = get().getCurrentQuests();
        set({ lastSessionAccuracy: accuracy });

        // Update accuracy-based quests
        quests.forEach((quest) => {
          if (quest.type === 'accuracy') {
            if (accuracy >= quest.target) {
              get().updateQuestProgress(quest.id, quest.target, true);
            }
          }
        });
      },

      recordReviewCount: (count) => {
        const quests = get().getCurrentQuests();

        quests.forEach((quest) => {
          if (quest.type === 'reviews') {
            get().updateQuestProgress(quest.id, count);
          }
        });
      },

      recordPerfectSession: () => {
        const quests = get().getCurrentQuests();

        quests.forEach((quest) => {
          if (quest.type === 'perfect_session') {
            get().updateQuestProgress(quest.id, 1);
          }
        });
      },

      recordWordsLearned: (count) => {
        const quests = get().getCurrentQuests();

        quests.forEach((quest) => {
          if (quest.type === 'words_learned') {
            get().updateQuestProgress(quest.id, count);
          }
        });
      },

      getTotalUnclaimedRewards: () => {
        const { questProgress } = get();
        const quests = getDailyQuests(get().questDate || getTodayDateStr());

        return quests.reduce((total, quest) => {
          const progress = questProgress[quest.id];
          if (progress?.completed && !progress.claimedAt) {
            return total + quest.reward;
          }
          return total;
        }, 0);
      },

      claimAllRewards: () => {
        const { questProgress } = get();
        const quests = getDailyQuests(get().questDate || getTodayDateStr());
        let totalReward = 0;

        const updatedProgress: Record<string, QuestProgress> = { ...questProgress };

        quests.forEach((quest) => {
          const progress = questProgress[quest.id];
          if (progress?.completed && !progress.claimedAt) {
            totalReward += quest.reward;
            updatedProgress[quest.id] = {
              ...progress,
              claimedAt: new Date().toISOString(),
            };
          }
        });

        set({ questProgress: updatedProgress });
        return totalReward;
      },
    }),
    {
      name: 'koine-quest-store',
    }
  )
);
