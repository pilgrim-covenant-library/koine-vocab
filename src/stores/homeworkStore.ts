import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SectionId,
  Homework1Progress,
  SectionProgress,
  QuestionAnswer,
  HW2SectionId,
  Homework2Progress,
  HW2SectionProgress,
} from '@/types/homework';
import {
  createInitialHomework1Progress,
  createInitialSectionProgress,
  createInitialHomework2Progress,
  createInitialHW2SectionProgress,
} from '@/types/homework';
import {
  syncHomeworkToCloud,
  getHomeworkFromCloud,
  submitHomeworkResult,
  isFirebaseAvailable,
} from '@/lib/firebase';

interface HomeworkState {
  // Homework 1 progress
  homework1: Homework1Progress;

  // Homework 2 progress
  homework2: Homework2Progress;

  // Sync state
  isSyncing: boolean;
  lastSyncedAt: number | null;

  // HW1 Actions
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

  // HW2 Actions
  startHomework2: () => void;
  startSection2: (sectionId: HW2SectionId) => void;
  submitAnswer2: (
    sectionId: HW2SectionId,
    questionId: string,
    userAnswer: string | number,
    isCorrect: boolean
  ) => void;
  nextQuestion2: (sectionId: HW2SectionId) => boolean;
  previousQuestion2: (sectionId: HW2SectionId) => boolean;
  completeSection2: (sectionId: HW2SectionId) => void;
  completeHomework2: () => void;
  resetHomework2: () => void;
  resetSection2: (sectionId: HW2SectionId) => void;

  // Cloud sync actions
  syncToCloud: (uid: string) => Promise<void>;
  loadFromCloud: (uid: string) => Promise<boolean>; // returns true if cloud data was loaded
  submitResult: (uid: string, userInfo: { displayName: string | null; email: string | null }) => Promise<void>;

  // HW2 Cloud sync actions
  syncToCloud2: (uid: string) => Promise<void>;
  loadFromCloud2: (uid: string) => Promise<boolean>;
  submitResult2: (uid: string, userInfo: { displayName: string | null; email: string | null }) => Promise<void>;

  // HW1 Getters
  getCurrentSection: () => SectionProgress;
  getSectionProgress: (sectionId: SectionId) => SectionProgress;
  getOverallProgress: () => { completed: number; total: number; percentage: number };
  canAccessSection: (sectionId: SectionId) => boolean;
  isHomeworkComplete: () => boolean;
  getAnswer: (sectionId: SectionId, questionId: string) => QuestionAnswer | undefined;

  // HW2 Getters
  getCurrentSection2: () => HW2SectionProgress;
  getSectionProgress2: (sectionId: HW2SectionId) => HW2SectionProgress;
  getOverallProgress2: () => { completed: number; total: number; percentage: number };
  canAccessSection2: (sectionId: HW2SectionId) => boolean;
  isHomework2Complete: () => boolean;
  getAnswer2: (sectionId: HW2SectionId, questionId: string) => QuestionAnswer | undefined;
}

export const useHomeworkStore = create<HomeworkState>()(
  persist(
    (set, get) => ({
      homework1: createInitialHomework1Progress(),
      homework2: createInitialHomework2Progress(),
      isSyncing: false,
      lastSyncedAt: null,

      // =============================================================================
      // HW1 ACTIONS
      // =============================================================================

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

      canAccessSection: (_sectionId: SectionId) => {
        // All sections are always accessible - users can complete in any order
        return true;
      },

      isHomeworkComplete: () => {
        const { homework1 } = get();
        return homework1.status === 'completed';
      },

      getAnswer: (sectionId: SectionId, questionId: string) => {
        const { homework1 } = get();
        return homework1.sections[sectionId].answers.find(a => a.questionId === questionId);
      },

      // =============================================================================
      // HW2 ACTIONS
      // =============================================================================

      startHomework2: () => {
        const { homework2 } = get();
        if (homework2.status === 'not_started') {
          set({
            homework2: {
              ...homework2,
              status: 'in_progress',
              startedAt: Date.now(),
            },
          });
        }
      },

      startSection2: (sectionId: HW2SectionId) => {
        const { homework2, canAccessSection2 } = get();
        if (!canAccessSection2(sectionId)) return;

        const section = homework2.sections[sectionId];
        if (section.status === 'not_started') {
          set({
            homework2: {
              ...homework2,
              currentSection: sectionId,
              sections: {
                ...homework2.sections,
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
            homework2: {
              ...homework2,
              currentSection: sectionId,
            },
          });
        }
      },

      submitAnswer2: (
        sectionId: HW2SectionId,
        questionId: string,
        userAnswer: string | number,
        isCorrect: boolean
      ) => {
        const { homework2 } = get();
        const section = homework2.sections[sectionId];

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
          homework2: {
            ...homework2,
            totalScore: homework2.totalScore + scoreDiff,
            sections: {
              ...homework2.sections,
              [sectionId]: {
                ...section,
                answers: newAnswers,
                score: section.score + scoreDiff,
              },
            },
          },
        });
      },

      nextQuestion2: (sectionId: HW2SectionId) => {
        const { homework2 } = get();
        const section = homework2.sections[sectionId];

        if (section.currentIndex < section.totalQuestions - 1) {
          set({
            homework2: {
              ...homework2,
              sections: {
                ...homework2.sections,
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

      previousQuestion2: (sectionId: HW2SectionId) => {
        const { homework2 } = get();
        const section = homework2.sections[sectionId];

        if (section.currentIndex > 0) {
          set({
            homework2: {
              ...homework2,
              sections: {
                ...homework2.sections,
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

      completeSection2: (sectionId: HW2SectionId) => {
        const { homework2 } = get();
        const section = homework2.sections[sectionId];

        // Calculate next section
        const nextSectionId = sectionId < 5 ? (sectionId + 1) as HW2SectionId : null;

        set({
          homework2: {
            ...homework2,
            currentSection: nextSectionId ?? sectionId,
            sections: {
              ...homework2.sections,
              [sectionId]: {
                ...section,
                status: 'completed',
                completedAt: Date.now(),
              },
            },
          },
        });
      },

      completeHomework2: () => {
        const { homework2 } = get();
        set({
          homework2: {
            ...homework2,
            status: 'completed',
            completedAt: Date.now(),
          },
        });
      },

      resetHomework2: () => {
        set({
          homework2: createInitialHomework2Progress(),
        });
      },

      resetSection2: (sectionId: HW2SectionId) => {
        const { homework2 } = get();
        const section = homework2.sections[sectionId];
        const scoreDiff = section.score;

        set({
          homework2: {
            ...homework2,
            totalScore: homework2.totalScore - scoreDiff,
            sections: {
              ...homework2.sections,
              [sectionId]: createInitialHW2SectionProgress(sectionId, section.totalQuestions),
            },
          },
        });
      },

      // HW2 Cloud sync actions
      syncToCloud2: async (uid: string) => {
        if (!isFirebaseAvailable()) return;

        const { homework2, isSyncing } = get();
        if (isSyncing) return; // Prevent concurrent syncs

        set({ isSyncing: true });

        try {
          await syncHomeworkToCloud(uid, 'hw2', homework2);
          set({ lastSyncedAt: Date.now(), isSyncing: false });
        } catch (error) {
          console.error('Failed to sync homework2 to cloud:', error);
          set({ isSyncing: false });
        }
      },

      loadFromCloud2: async (uid: string) => {
        if (!isFirebaseAvailable()) return false;

        try {
          const cloudData = await getHomeworkFromCloud(uid, 'hw2');
          if (cloudData) {
            const { homework2 } = get();

            // Cloud data takes priority for completed sections
            // Merge strategy: use cloud data if it has more progress
            const shouldUseCloudData =
              cloudData.status === 'completed' ||
              (cloudData.status === 'in_progress' && homework2.status === 'not_started') ||
              cloudData.totalScore > homework2.totalScore;

            if (shouldUseCloudData) {
              set({
                homework2: cloudData as Homework2Progress,
                lastSyncedAt: Date.now(),
              });
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error('Failed to load homework2 from cloud:', error);
          return false;
        }
      },

      // Submit completed homework2 result to teacher dashboard
      submitResult2: async (uid: string, userInfo: { displayName: string | null; email: string | null }) => {
        if (!isFirebaseAvailable()) return;

        const { homework2 } = get();
        if (homework2.status !== 'completed') return;

        try {
          // Build sections summary for teacher view
          const sections: Record<string, { score: number; totalQuestions: number; status: string }> = {};
          for (const [key, section] of Object.entries(homework2.sections)) {
            sections[key] = {
              score: section.score,
              totalQuestions: section.totalQuestions,
              status: section.status,
            };
          }

          await submitHomeworkResult(
            uid,
            'hw2',
            userInfo,
            homework2.totalScore,
            homework2.totalPossible,
            sections
          );
        } catch (error) {
          console.error('Failed to submit homework2 result:', error);
        }
      },

      // HW2 Getters
      getCurrentSection2: () => {
        const { homework2 } = get();
        return homework2.sections[homework2.currentSection];
      },

      getSectionProgress2: (sectionId: HW2SectionId) => {
        const { homework2 } = get();
        return homework2.sections[sectionId];
      },

      getOverallProgress2: () => {
        const { homework2 } = get();
        const sections = Object.values(homework2.sections);
        const completed = sections.filter(s => s.status === 'completed').length;
        return {
          completed,
          total: 5,
          percentage: Math.round((completed / 5) * 100),
        };
      },

      canAccessSection2: (_sectionId: HW2SectionId) => {
        // All sections are always accessible - users can complete in any order
        return true;
      },

      isHomework2Complete: () => {
        const { homework2 } = get();
        return homework2.status === 'completed';
      },

      getAnswer2: (sectionId: HW2SectionId, questionId: string) => {
        const { homework2 } = get();
        return homework2.sections[sectionId].answers.find(a => a.questionId === questionId);
      },
    }),
    {
      name: 'koine-homework-store',
      version: 4, // Bump version for all sections question count fix
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { homework2?: Homework2Progress };

        if (version < 4 && state.homework2) {
          // Fix all section totalQuestions to match actual question counts
          const correctCounts: Record<HW2SectionId, number> = {
            1: 24, 2: 24, 3: 24, 4: 24, 5: 40
          };
          for (const [id, count] of Object.entries(correctCounts)) {
            const sectionId = Number(id) as HW2SectionId;
            if (state.homework2.sections[sectionId].totalQuestions !== count) {
              state.homework2.sections[sectionId].totalQuestions = count;
            }
          }
          // Ensure totalPossible is correct (24+24+24+24+40 = 156)
          state.homework2.totalPossible = 156;
        }
        return state as HomeworkState;
      },
      partialize: (state) => ({
        homework1: state.homework1,
        homework2: state.homework2,
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
      // If user just signed out (was logged in, now null), reset all homework
      if (previousUser && !currentUser) {
        useHomeworkStore.getState().resetHomework();
        useHomeworkStore.getState().resetHomework2();
      }
      previousUser = currentUser;
    });
  });
}
