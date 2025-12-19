import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SectionId,
  Homework1Progress,
  SectionProgress,
  QuestionAnswer,
} from '@/types/homework';
import { createInitialHomework1Progress, createInitialSectionProgress } from '@/types/homework';
import {
  syncHomeworkToCloud,
  getHomeworkFromCloud,
  submitHomeworkResult,
  isFirebaseAvailable,
} from '@/lib/firebase';

interface HomeworkState {
  // Homework 1 progress
  homework1: Homework1Progress;

  // Sync state
  isSyncing: boolean;
  lastSyncedAt: number | null;

  // Actions
  startHomework: () => void;
  startSection: (sectionId: SectionId) => void;
  submitAnswer: (
    sectionId: SectionId,
    questionId: string,
    userAnswer: string | number,
    isCorrect: boolean
  ) => void;
  nextQuestion: (sectionId: SectionId) => boolean; // returns true if more questions
  previousQuestion: (sectionId: SectionId) => boolean;
  completeSection: (sectionId: SectionId) => void;
  completeHomework: () => void;
  resetHomework: () => void;
  resetSection: (sectionId: SectionId) => void;

  // Cloud sync actions
  syncToCloud: (uid: string) => Promise<void>;
  loadFromCloud: (uid: string) => Promise<boolean>; // returns true if cloud data was loaded
  submitResult: (uid: string, userInfo: { displayName: string | null; email: string | null }) => Promise<void>;

  // Getters
  getCurrentSection: () => SectionProgress;
  getSectionProgress: (sectionId: SectionId) => SectionProgress;
  getOverallProgress: () => { completed: number; total: number; percentage: number };
  canAccessSection: (sectionId: SectionId) => boolean;
  isHomeworkComplete: () => boolean;
  getAnswer: (sectionId: SectionId, questionId: string) => QuestionAnswer | undefined;
}

export const useHomeworkStore = create<HomeworkState>()(
  persist(
    (set, get) => ({
      homework1: createInitialHomework1Progress(),
      isSyncing: false,
      lastSyncedAt: null,

      startHomework: () => {
        const { homework1 } = get();
        if (homework1.status === 'not_started') {
          set({
            homework1: {
              ...homework1,
              status: 'in_progress',
              startedAt: Date.now(),
            },
          });
        }
      },

      startSection: (sectionId: SectionId) => {
        const { homework1, canAccessSection } = get();
        if (!canAccessSection(sectionId)) return;

        const section = homework1.sections[sectionId];
        if (section.status === 'not_started') {
          set({
            homework1: {
              ...homework1,
              currentSection: sectionId,
              sections: {
                ...homework1.sections,
                [sectionId]: {
                  ...section,
                  status: 'in_progress',
                  startedAt: Date.now(),
                },
              },
            },
          });
        } else {
          // Just navigate to this section
          set({
            homework1: {
              ...homework1,
              currentSection: sectionId,
            },
          });
        }
      },

      submitAnswer: (
        sectionId: SectionId,
        questionId: string,
        userAnswer: string | number,
        isCorrect: boolean
      ) => {
        const { homework1 } = get();
        const section = homework1.sections[sectionId];

        // Check if already answered
        const existingIndex = section.answers.findIndex(a => a.questionId === questionId);

        const newAnswer: QuestionAnswer = {
          questionId,
          userAnswer,
          isCorrect,
          timestamp: Date.now(),
        };

        let newAnswers: QuestionAnswer[];
        let scoreDiff = 0;

        if (existingIndex >= 0) {
          // Update existing answer
          const oldAnswer = section.answers[existingIndex];
          if (oldAnswer.isCorrect && !isCorrect) scoreDiff = -1;
          else if (!oldAnswer.isCorrect && isCorrect) scoreDiff = 1;

          newAnswers = [...section.answers];
          newAnswers[existingIndex] = newAnswer;
        } else {
          // New answer
          newAnswers = [...section.answers, newAnswer];
          if (isCorrect) scoreDiff = 1;
        }

        set({
          homework1: {
            ...homework1,
            totalScore: homework1.totalScore + scoreDiff,
            sections: {
              ...homework1.sections,
              [sectionId]: {
                ...section,
                answers: newAnswers,
                score: section.score + scoreDiff,
              },
            },
          },
        });
      },

      nextQuestion: (sectionId: SectionId) => {
        const { homework1 } = get();
        const section = homework1.sections[sectionId];

        if (section.currentIndex < section.totalQuestions - 1) {
          set({
            homework1: {
              ...homework1,
              sections: {
                ...homework1.sections,
                [sectionId]: {
                  ...section,
                  currentIndex: section.currentIndex + 1,
                },
              },
            },
          });
          return true;
        }
        return false;
      },

      previousQuestion: (sectionId: SectionId) => {
        const { homework1 } = get();
        const section = homework1.sections[sectionId];

        if (section.currentIndex > 0) {
          set({
            homework1: {
              ...homework1,
              sections: {
                ...homework1.sections,
                [sectionId]: {
                  ...section,
                  currentIndex: section.currentIndex - 1,
                },
              },
            },
          });
          return true;
        }
        return false;
      },

      completeSection: (sectionId: SectionId) => {
        const { homework1 } = get();
        const section = homework1.sections[sectionId];

        // Calculate next section
        const nextSectionId = sectionId < 5 ? (sectionId + 1) as SectionId : null;

        set({
          homework1: {
            ...homework1,
            currentSection: nextSectionId ?? sectionId,
            sections: {
              ...homework1.sections,
              [sectionId]: {
                ...section,
                status: 'completed',
                completedAt: Date.now(),
              },
            },
          },
        });
      },

      completeHomework: () => {
        const { homework1 } = get();
        set({
          homework1: {
            ...homework1,
            status: 'completed',
            completedAt: Date.now(),
          },
        });
      },

      resetHomework: () => {
        set({
          homework1: createInitialHomework1Progress(),
        });
      },

      resetSection: (sectionId: SectionId) => {
        const { homework1 } = get();
        const section = homework1.sections[sectionId];
        const scoreDiff = section.score;

        set({
          homework1: {
            ...homework1,
            totalScore: homework1.totalScore - scoreDiff,
            sections: {
              ...homework1.sections,
              [sectionId]: createInitialSectionProgress(sectionId, section.totalQuestions),
            },
          },
        });
      },

      // Cloud sync actions
      syncToCloud: async (uid: string) => {
        if (!isFirebaseAvailable()) return;

        const { homework1, isSyncing } = get();
        if (isSyncing) return; // Prevent concurrent syncs

        set({ isSyncing: true });

        try {
          await syncHomeworkToCloud(uid, 'hw1', homework1);
          set({ lastSyncedAt: Date.now(), isSyncing: false });
        } catch (error) {
          console.error('Failed to sync homework to cloud:', error);
          set({ isSyncing: false });
        }
      },

      loadFromCloud: async (uid: string) => {
        if (!isFirebaseAvailable()) return false;

        try {
          const cloudData = await getHomeworkFromCloud(uid, 'hw1');
          if (cloudData) {
            const { homework1 } = get();

            // Cloud data takes priority for completed sections
            // Merge strategy: use cloud data if it has more progress
            const shouldUseCloudData =
              cloudData.status === 'completed' ||
              (cloudData.status === 'in_progress' && homework1.status === 'not_started') ||
              cloudData.totalScore > homework1.totalScore;

            if (shouldUseCloudData) {
              set({
                homework1: cloudData,
                lastSyncedAt: Date.now(),
              });
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error('Failed to load homework from cloud:', error);
          return false;
        }
      },

      // Submit completed homework result to teacher dashboard
      submitResult: async (uid: string, userInfo: { displayName: string | null; email: string | null }) => {
        if (!isFirebaseAvailable()) return;

        const { homework1 } = get();
        if (homework1.status !== 'completed') return;

        try {
          // Build sections summary for teacher view
          const sections: Record<string, { score: number; totalQuestions: number; status: string }> = {};
          for (const [key, section] of Object.entries(homework1.sections)) {
            sections[key] = {
              score: section.score,
              totalQuestions: section.totalQuestions,
              status: section.status,
            };
          }

          await submitHomeworkResult(
            uid,
            'hw1',
            userInfo,
            homework1.totalScore,
            homework1.totalPossible,
            sections
          );
        } catch (error) {
          console.error('Failed to submit homework result:', error);
        }
      },

      getCurrentSection: () => {
        const { homework1 } = get();
        return homework1.sections[homework1.currentSection];
      },

      getSectionProgress: (sectionId: SectionId) => {
        const { homework1 } = get();
        return homework1.sections[sectionId];
      },

      getOverallProgress: () => {
        const { homework1 } = get();
        const sections = Object.values(homework1.sections);
        const completed = sections.filter(s => s.status === 'completed').length;
        return {
          completed,
          total: 5,
          percentage: Math.round((completed / 5) * 100),
        };
      },

      canAccessSection: (sectionId: SectionId) => {
        const { homework1 } = get();
        // Section 1 is always accessible
        if (sectionId === 1) return true;
        // Other sections require previous section to be completed
        const prevSection = homework1.sections[(sectionId - 1) as SectionId];
        return prevSection.status === 'completed';
      },

      isHomeworkComplete: () => {
        const { homework1 } = get();
        return homework1.status === 'completed';
      },

      getAnswer: (sectionId: SectionId, questionId: string) => {
        const { homework1 } = get();
        return homework1.sections[sectionId].answers.find(a => a.questionId === questionId);
      },
    }),
    {
      name: 'koine-homework-store',
      version: 1,
      partialize: (state) => ({
        homework1: state.homework1,
        lastSyncedAt: state.lastSyncedAt,
        // Exclude isSyncing - always starts as false
      }),
    }
  )
);

// Subscribe to auth changes to reset homework on sign out
// This prevents one user's homework from persisting to another user
if (typeof window !== 'undefined') {
  // Dynamically import to avoid circular dependency
  import('./authStore').then(({ useAuthStore }) => {
    let previousUser = useAuthStore.getState().user;

    useAuthStore.subscribe((state) => {
      const currentUser = state.user;
      // If user just signed out (was logged in, now null), reset homework
      if (previousUser && !currentUser) {
        useHomeworkStore.getState().resetHomework();
      }
      previousUser = currentUser;
    });
  });
}
