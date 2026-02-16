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
  HW3SectionId,
  Homework3Progress,
  HW3SectionProgress,
  HW4SectionId,
  Homework4Progress,
  HW4SectionProgress,
  HW5SectionId,
  Homework5Progress,
  HW5SectionProgress,
} from '@/types/homework';
import {
  createInitialHomework1Progress,
  createInitialSectionProgress,
  createInitialHomework2Progress,
  createInitialHW2SectionProgress,
  createInitialHomework3Progress,
  createInitialHW3SectionProgress,
  createInitialHomework4Progress,
  createInitialHW4SectionProgress,
  createInitialHomework5Progress,
  createInitialHW5SectionProgress,
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

  // Homework 3 progress
  homework3: Homework3Progress;

  // Homework 4 progress
  homework4: Homework4Progress;

  // Homework 5 progress
  homework5: Homework5Progress;

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

  // HW3 Actions
  startHomework3: () => void;
  startSection3: (sectionId: HW3SectionId) => void;
  submitAnswer3: (
    sectionId: HW3SectionId,
    questionId: string,
    userAnswer: string | number,
    isCorrect: boolean
  ) => void;
  nextQuestion3: (sectionId: HW3SectionId) => boolean;
  previousQuestion3: (sectionId: HW3SectionId) => boolean;
  completeSection3: (sectionId: HW3SectionId) => void;
  completeHomework3: () => void;
  resetHomework3: () => void;
  resetSection3: (sectionId: HW3SectionId) => void;

  // HW4 Actions
  startHomework4: () => void;
  startSection4: (sectionId: HW4SectionId) => void;
  submitAnswer4: (
    sectionId: HW4SectionId,
    questionId: string,
    userAnswer: string | number,
    isCorrect: boolean
  ) => void;
  nextQuestion4: (sectionId: HW4SectionId) => boolean;
  previousQuestion4: (sectionId: HW4SectionId) => boolean;
  completeSection4: (sectionId: HW4SectionId) => void;
  completeHomework4: () => void;
  resetHomework4: () => void;
  resetSection4: (sectionId: HW4SectionId) => void;

  // HW5 Actions
  startHomework5: () => void;
  startSection5: (sectionId: HW5SectionId) => void;
  submitAnswer5: (
    sectionId: HW5SectionId,
    questionId: string,
    userAnswer: string | number,
    isCorrect: boolean
  ) => void;
  nextQuestion5: (sectionId: HW5SectionId) => boolean;
  previousQuestion5: (sectionId: HW5SectionId) => boolean;
  completeSection5: (sectionId: HW5SectionId) => void;
  completeHomework5: () => void;
  resetHomework5: () => void;
  resetSection5: (sectionId: HW5SectionId) => void;

  // Cloud sync actions
  syncToCloud: (uid: string) => Promise<void>;
  loadFromCloud: (uid: string) => Promise<boolean>; // returns true if cloud data was loaded
  submitResult: (uid: string, userInfo: { displayName: string | null; email: string | null }) => Promise<void>;

  // HW2 Cloud sync actions
  syncToCloud2: (uid: string) => Promise<void>;
  loadFromCloud2: (uid: string) => Promise<boolean>;
  submitResult2: (uid: string, userInfo: { displayName: string | null; email: string | null }) => Promise<void>;

  // HW3 Cloud sync actions
  syncToCloud3: (uid: string) => Promise<void>;
  loadFromCloud3: (uid: string) => Promise<boolean>;
  submitResult3: (uid: string, userInfo: { displayName: string | null; email: string | null }) => Promise<void>;

  // HW4 Cloud sync actions
  syncToCloud4: (uid: string) => Promise<void>;
  loadFromCloud4: (uid: string) => Promise<boolean>;
  submitResult4: (uid: string, userInfo: { displayName: string | null; email: string | null }) => Promise<void>;

  // HW5 Cloud sync actions
  syncToCloud5: (uid: string) => Promise<void>;
  loadFromCloud5: (uid: string) => Promise<boolean>;
  submitResult5: (uid: string, userInfo: { displayName: string | null; email: string | null }) => Promise<void>;

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

  // HW3 Getters
  getCurrentSection3: () => HW3SectionProgress;
  getSectionProgress3: (sectionId: HW3SectionId) => HW3SectionProgress;
  getOverallProgress3: () => { completed: number; total: number; percentage: number };
  canAccessSection3: (sectionId: HW3SectionId) => boolean;
  isHomework3Complete: () => boolean;
  getAnswer3: (sectionId: HW3SectionId, questionId: string) => QuestionAnswer | undefined;

  // HW4 Getters
  getCurrentSection4: () => HW4SectionProgress;
  getSectionProgress4: (sectionId: HW4SectionId) => HW4SectionProgress;
  getOverallProgress4: () => { completed: number; total: number; percentage: number };
  canAccessSection4: (sectionId: HW4SectionId) => boolean;
  isHomework4Complete: () => boolean;
  getAnswer4: (sectionId: HW4SectionId, questionId: string) => QuestionAnswer | undefined;

  // HW5 Getters
  getCurrentSection5: () => HW5SectionProgress;
  getSectionProgress5: (sectionId: HW5SectionId) => HW5SectionProgress;
  getOverallProgress5: () => { completed: number; total: number; percentage: number };
  canAccessSection5: (sectionId: HW5SectionId) => boolean;
  isHomework5Complete: () => boolean;
  getAnswer5: (sectionId: HW5SectionId, questionId: string) => QuestionAnswer | undefined;
}

export const useHomeworkStore = create<HomeworkState>()(
  persist(
    (set, get) => ({
      homework1: createInitialHomework1Progress(),
      homework2: createInitialHomework2Progress(),
      homework3: createInitialHomework3Progress(),
      homework4: createInitialHomework4Progress(),
      homework5: createInitialHomework5Progress(),
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
                homework1: cloudData as Homework1Progress,
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

      // =============================================================================
      // HW3 ACTIONS
      // =============================================================================

      startHomework3: () => {
        const { homework3 } = get();
        if (homework3.status === 'not_started') {
          set({
            homework3: {
              ...homework3,
              status: 'in_progress',
              startedAt: Date.now(),
            },
          });
        }
      },

      startSection3: (sectionId: HW3SectionId) => {
        const { homework3, canAccessSection3 } = get();
        if (!canAccessSection3(sectionId)) return;

        const section = homework3.sections[sectionId];
        if (section.status === 'not_started') {
          set({
            homework3: {
              ...homework3,
              currentSection: sectionId,
              sections: {
                ...homework3.sections,
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
            homework3: {
              ...homework3,
              currentSection: sectionId,
            },
          });
        }
      },

      submitAnswer3: (
        sectionId: HW3SectionId,
        questionId: string,
        userAnswer: string | number,
        isCorrect: boolean
      ) => {
        const { homework3 } = get();
        const section = homework3.sections[sectionId];

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
          homework3: {
            ...homework3,
            totalScore: homework3.totalScore + scoreDiff,
            sections: {
              ...homework3.sections,
              [sectionId]: {
                ...section,
                answers: newAnswers,
                score: section.score + scoreDiff,
              },
            },
          },
        });
      },

      nextQuestion3: (sectionId: HW3SectionId) => {
        const { homework3 } = get();
        const section = homework3.sections[sectionId];

        if (section.currentIndex < section.totalQuestions - 1) {
          set({
            homework3: {
              ...homework3,
              sections: {
                ...homework3.sections,
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

      previousQuestion3: (sectionId: HW3SectionId) => {
        const { homework3 } = get();
        const section = homework3.sections[sectionId];

        if (section.currentIndex > 0) {
          set({
            homework3: {
              ...homework3,
              sections: {
                ...homework3.sections,
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

      completeSection3: (sectionId: HW3SectionId) => {
        const { homework3 } = get();
        const section = homework3.sections[sectionId];

        // Calculate next section
        const nextSectionId = sectionId < 5 ? (sectionId + 1) as HW3SectionId : null;

        set({
          homework3: {
            ...homework3,
            currentSection: nextSectionId ?? sectionId,
            sections: {
              ...homework3.sections,
              [sectionId]: {
                ...section,
                status: 'completed',
                completedAt: Date.now(),
              },
            },
          },
        });
      },

      completeHomework3: () => {
        const { homework3 } = get();
        set({
          homework3: {
            ...homework3,
            status: 'completed',
            completedAt: Date.now(),
          },
        });
      },

      resetHomework3: () => {
        set({
          homework3: createInitialHomework3Progress(),
        });
      },

      resetSection3: (sectionId: HW3SectionId) => {
        const { homework3 } = get();
        const section = homework3.sections[sectionId];
        const scoreDiff = section.score;

        set({
          homework3: {
            ...homework3,
            totalScore: homework3.totalScore - scoreDiff,
            sections: {
              ...homework3.sections,
              [sectionId]: createInitialHW3SectionProgress(sectionId, section.totalQuestions),
            },
          },
        });
      },

      // HW3 Cloud sync actions
      syncToCloud3: async (uid: string) => {
        if (!isFirebaseAvailable()) return;

        const { homework3, isSyncing } = get();
        if (isSyncing) return; // Prevent concurrent syncs

        set({ isSyncing: true });

        try {
          await syncHomeworkToCloud(uid, 'hw3', homework3);
          set({ lastSyncedAt: Date.now(), isSyncing: false });
        } catch (error) {
          console.error('Failed to sync homework3 to cloud:', error);
          set({ isSyncing: false });
        }
      },

      loadFromCloud3: async (uid: string) => {
        if (!isFirebaseAvailable()) return false;

        try {
          const cloudData = await getHomeworkFromCloud(uid, 'hw3');
          if (cloudData) {
            const { homework3 } = get();

            // Cloud data takes priority for completed sections
            // Merge strategy: use cloud data if it has more progress
            const shouldUseCloudData =
              cloudData.status === 'completed' ||
              (cloudData.status === 'in_progress' && homework3.status === 'not_started') ||
              cloudData.totalScore > homework3.totalScore;

            if (shouldUseCloudData) {
              set({
                homework3: cloudData as Homework3Progress,
                lastSyncedAt: Date.now(),
              });
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error('Failed to load homework3 from cloud:', error);
          return false;
        }
      },

      // Submit completed homework3 result to teacher dashboard
      submitResult3: async (uid: string, userInfo: { displayName: string | null; email: string | null }) => {
        if (!isFirebaseAvailable()) return;

        const { homework3 } = get();
        if (homework3.status !== 'completed') return;

        try {
          // Build sections summary for teacher view
          const sections: Record<string, { score: number; totalQuestions: number; status: string }> = {};
          for (const [key, section] of Object.entries(homework3.sections)) {
            sections[key] = {
              score: section.score,
              totalQuestions: section.totalQuestions,
              status: section.status,
            };
          }

          await submitHomeworkResult(
            uid,
            'hw3',
            userInfo,
            homework3.totalScore,
            homework3.totalPossible,
            sections
          );
        } catch (error) {
          console.error('Failed to submit homework3 result:', error);
        }
      },

      // HW3 Getters
      getCurrentSection3: () => {
        const { homework3 } = get();
        return homework3.sections[homework3.currentSection];
      },

      getSectionProgress3: (sectionId: HW3SectionId) => {
        const { homework3 } = get();
        return homework3.sections[sectionId];
      },

      getOverallProgress3: () => {
        const { homework3 } = get();
        const sections = Object.values(homework3.sections);
        const completed = sections.filter(s => s.status === 'completed').length;
        return {
          completed,
          total: 5,
          percentage: Math.round((completed / 5) * 100),
        };
      },

      canAccessSection3: (_sectionId: HW3SectionId) => {
        // All sections are always accessible - users can complete in any order
        return true;
      },

      isHomework3Complete: () => {
        const { homework3 } = get();
        return homework3.status === 'completed';
      },

      getAnswer3: (sectionId: HW3SectionId, questionId: string) => {
        const { homework3 } = get();
        return homework3.sections[sectionId].answers.find(a => a.questionId === questionId);
      },

      // =============================================================================
      // HW4 ACTIONS
      // =============================================================================

      startHomework4: () => {
        const { homework4 } = get();
        if (homework4.status === 'not_started') {
          set({
            homework4: {
              ...homework4,
              status: 'in_progress',
              startedAt: Date.now(),
            },
          });
        }
      },

      startSection4: (sectionId: HW4SectionId) => {
        const { homework4, canAccessSection4 } = get();
        if (!canAccessSection4(sectionId)) return;

        const section = homework4.sections[sectionId];
        if (section.status === 'not_started') {
          set({
            homework4: {
              ...homework4,
              currentSection: sectionId,
              sections: {
                ...homework4.sections,
                [sectionId]: {
                  ...section,
                  status: 'in_progress',
                  startedAt: Date.now(),
                },
              },
            },
          });
        } else {
          set({
            homework4: {
              ...homework4,
              currentSection: sectionId,
            },
          });
        }
      },

      submitAnswer4: (
        sectionId: HW4SectionId,
        questionId: string,
        userAnswer: string | number,
        isCorrect: boolean
      ) => {
        const { homework4 } = get();
        const section = homework4.sections[sectionId];

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
          const oldAnswer = section.answers[existingIndex];
          if (oldAnswer.isCorrect && !isCorrect) scoreDiff = -1;
          else if (!oldAnswer.isCorrect && isCorrect) scoreDiff = 1;

          newAnswers = [...section.answers];
          newAnswers[existingIndex] = newAnswer;
        } else {
          newAnswers = [...section.answers, newAnswer];
          if (isCorrect) scoreDiff = 1;
        }

        set({
          homework4: {
            ...homework4,
            totalScore: homework4.totalScore + scoreDiff,
            sections: {
              ...homework4.sections,
              [sectionId]: {
                ...section,
                answers: newAnswers,
                score: section.score + scoreDiff,
              },
            },
          },
        });
      },

      nextQuestion4: (sectionId: HW4SectionId) => {
        const { homework4 } = get();
        const section = homework4.sections[sectionId];

        if (section.currentIndex < section.totalQuestions - 1) {
          set({
            homework4: {
              ...homework4,
              sections: {
                ...homework4.sections,
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

      previousQuestion4: (sectionId: HW4SectionId) => {
        const { homework4 } = get();
        const section = homework4.sections[sectionId];

        if (section.currentIndex > 0) {
          set({
            homework4: {
              ...homework4,
              sections: {
                ...homework4.sections,
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

      completeSection4: (sectionId: HW4SectionId) => {
        const { homework4 } = get();
        const section = homework4.sections[sectionId];

        const nextSectionId = sectionId < 6 ? (sectionId + 1) as HW4SectionId : null;

        set({
          homework4: {
            ...homework4,
            currentSection: nextSectionId ?? sectionId,
            sections: {
              ...homework4.sections,
              [sectionId]: {
                ...section,
                status: 'completed',
                completedAt: Date.now(),
              },
            },
          },
        });
      },

      completeHomework4: () => {
        const { homework4 } = get();
        set({
          homework4: {
            ...homework4,
            status: 'completed',
            completedAt: Date.now(),
          },
        });
      },

      resetHomework4: () => {
        set({
          homework4: createInitialHomework4Progress(),
        });
      },

      resetSection4: (sectionId: HW4SectionId) => {
        const { homework4 } = get();
        const section = homework4.sections[sectionId];
        const scoreDiff = section.score;

        set({
          homework4: {
            ...homework4,
            totalScore: homework4.totalScore - scoreDiff,
            sections: {
              ...homework4.sections,
              [sectionId]: createInitialHW4SectionProgress(sectionId, section.totalQuestions),
            },
          },
        });
      },

      // HW4 Cloud sync actions
      syncToCloud4: async (uid: string) => {
        if (!isFirebaseAvailable()) return;

        const { homework4, isSyncing } = get();
        if (isSyncing) return;

        set({ isSyncing: true });

        try {
          await syncHomeworkToCloud(uid, 'hw4', homework4);
          set({ lastSyncedAt: Date.now(), isSyncing: false });
        } catch (error) {
          console.error('Failed to sync homework4 to cloud:', error);
          set({ isSyncing: false });
        }
      },

      loadFromCloud4: async (uid: string) => {
        if (!isFirebaseAvailable()) return false;

        try {
          const cloudData = await getHomeworkFromCloud(uid, 'hw4');
          if (cloudData) {
            const { homework4 } = get();

            // Forward-migrate cloud data: ensure section 6 exists
            // (cloud data saved before section 6 was added won't have it)
            if (!cloudData.sections[6]) {
              cloudData.sections[6] = createInitialHW4SectionProgress(6 as HW4SectionId, 10);
              cloudData.totalPossible = 72;
            }

            const shouldUseCloudData =
              cloudData.status === 'completed' ||
              (cloudData.status === 'in_progress' && homework4.status === 'not_started') ||
              cloudData.totalScore > homework4.totalScore;

            if (shouldUseCloudData) {
              set({
                homework4: cloudData as Homework4Progress,
                lastSyncedAt: Date.now(),
              });
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error('Failed to load homework4 from cloud:', error);
          return false;
        }
      },

      submitResult4: async (uid: string, userInfo: { displayName: string | null; email: string | null }) => {
        if (!isFirebaseAvailable()) return;

        const { homework4 } = get();
        if (homework4.status !== 'completed') return;

        try {
          const sections: Record<string, { score: number; totalQuestions: number; status: string }> = {};
          for (const [key, section] of Object.entries(homework4.sections)) {
            sections[key] = {
              score: section.score,
              totalQuestions: section.totalQuestions,
              status: section.status,
            };
          }

          await submitHomeworkResult(
            uid,
            'hw4',
            userInfo,
            homework4.totalScore,
            homework4.totalPossible,
            sections
          );
        } catch (error) {
          console.error('Failed to submit homework4 result:', error);
        }
      },

      // HW4 Getters
      getCurrentSection4: () => {
        const { homework4 } = get();
        return homework4.sections[homework4.currentSection];
      },

      getSectionProgress4: (sectionId: HW4SectionId) => {
        const { homework4 } = get();
        return homework4.sections[sectionId];
      },

      getOverallProgress4: () => {
        const { homework4 } = get();
        const sections = Object.values(homework4.sections);
        const completed = sections.filter(s => s.status === 'completed').length;
        return {
          completed,
          total: 6,
          percentage: Math.round((completed / 6) * 100),
        };
      },

      canAccessSection4: (_sectionId: HW4SectionId) => {
        return true;
      },

      isHomework4Complete: () => {
        const { homework4 } = get();
        return homework4.status === 'completed';
      },

      getAnswer4: (sectionId: HW4SectionId, questionId: string) => {
        const { homework4 } = get();
        return homework4.sections[sectionId].answers.find(a => a.questionId === questionId);
      },

      // =============================================================================
      // HW5 ACTIONS
      // =============================================================================

      startHomework5: () => {
        const { homework5 } = get();
        if (homework5.status === 'not_started') {
          set({
            homework5: {
              ...homework5,
              status: 'in_progress',
              startedAt: Date.now(),
            },
          });
        }
      },

      startSection5: (sectionId: HW5SectionId) => {
        const { homework5, canAccessSection5 } = get();
        if (!canAccessSection5(sectionId)) return;

        const section = homework5.sections[sectionId];
        if (section.status === 'not_started') {
          set({
            homework5: {
              ...homework5,
              currentSection: sectionId,
              sections: {
                ...homework5.sections,
                [sectionId]: {
                  ...section,
                  status: 'in_progress',
                  startedAt: Date.now(),
                },
              },
            },
          });
        } else {
          set({
            homework5: {
              ...homework5,
              currentSection: sectionId,
            },
          });
        }
      },

      submitAnswer5: (
        sectionId: HW5SectionId,
        questionId: string,
        userAnswer: string | number,
        isCorrect: boolean
      ) => {
        const { homework5 } = get();
        const section = homework5.sections[sectionId];

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
          const oldAnswer = section.answers[existingIndex];
          if (oldAnswer.isCorrect && !isCorrect) scoreDiff = -1;
          else if (!oldAnswer.isCorrect && isCorrect) scoreDiff = 1;

          newAnswers = [...section.answers];
          newAnswers[existingIndex] = newAnswer;
        } else {
          newAnswers = [...section.answers, newAnswer];
          if (isCorrect) scoreDiff = 1;
        }

        set({
          homework5: {
            ...homework5,
            totalScore: homework5.totalScore + scoreDiff,
            sections: {
              ...homework5.sections,
              [sectionId]: {
                ...section,
                answers: newAnswers,
                score: section.score + scoreDiff,
              },
            },
          },
        });
      },

      nextQuestion5: (sectionId: HW5SectionId) => {
        const { homework5 } = get();
        const section = homework5.sections[sectionId];

        if (section.currentIndex < section.totalQuestions - 1) {
          set({
            homework5: {
              ...homework5,
              sections: {
                ...homework5.sections,
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

      previousQuestion5: (sectionId: HW5SectionId) => {
        const { homework5 } = get();
        const section = homework5.sections[sectionId];

        if (section.currentIndex > 0) {
          set({
            homework5: {
              ...homework5,
              sections: {
                ...homework5.sections,
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

      completeSection5: (sectionId: HW5SectionId) => {
        const { homework5 } = get();
        const section = homework5.sections[sectionId];

        const nextSectionId = sectionId < 6 ? (sectionId + 1) as HW5SectionId : null;

        set({
          homework5: {
            ...homework5,
            currentSection: nextSectionId ?? sectionId,
            sections: {
              ...homework5.sections,
              [sectionId]: {
                ...section,
                status: 'completed',
                completedAt: Date.now(),
              },
            },
          },
        });
      },

      completeHomework5: () => {
        const { homework5 } = get();
        set({
          homework5: {
            ...homework5,
            status: 'completed',
            completedAt: Date.now(),
          },
        });
      },

      resetHomework5: () => {
        set({
          homework5: createInitialHomework5Progress(),
        });
      },

      resetSection5: (sectionId: HW5SectionId) => {
        const { homework5 } = get();
        const section = homework5.sections[sectionId];
        const scoreDiff = section.score;

        set({
          homework5: {
            ...homework5,
            totalScore: homework5.totalScore - scoreDiff,
            sections: {
              ...homework5.sections,
              [sectionId]: createInitialHW5SectionProgress(sectionId, section.totalQuestions),
            },
          },
        });
      },

      // HW5 Cloud sync actions
      syncToCloud5: async (uid: string) => {
        if (!isFirebaseAvailable()) return;

        const { homework5, isSyncing } = get();
        if (isSyncing) return;

        set({ isSyncing: true });

        try {
          await syncHomeworkToCloud(uid, 'hw5', homework5);
          set({ lastSyncedAt: Date.now(), isSyncing: false });
        } catch (error) {
          console.error('Failed to sync homework5 to cloud:', error);
          set({ isSyncing: false });
        }
      },

      loadFromCloud5: async (uid: string) => {
        if (!isFirebaseAvailable()) return false;

        try {
          const cloudData = await getHomeworkFromCloud(uid, 'hw5');
          if (cloudData) {
            const { homework5 } = get();

            const shouldUseCloudData =
              cloudData.status === 'completed' ||
              (cloudData.status === 'in_progress' && homework5.status === 'not_started') ||
              cloudData.totalScore > homework5.totalScore;

            if (shouldUseCloudData) {
              set({
                homework5: cloudData as Homework5Progress,
                lastSyncedAt: Date.now(),
              });
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error('Failed to load homework5 from cloud:', error);
          return false;
        }
      },

      submitResult5: async (uid: string, userInfo: { displayName: string | null; email: string | null }) => {
        if (!isFirebaseAvailable()) return;

        const { homework5 } = get();
        if (homework5.status !== 'completed') return;

        try {
          const sections: Record<string, { score: number; totalQuestions: number; status: string }> = {};
          for (const [key, section] of Object.entries(homework5.sections)) {
            sections[key] = {
              score: section.score,
              totalQuestions: section.totalQuestions,
              status: section.status,
            };
          }

          await submitHomeworkResult(
            uid,
            'hw5',
            userInfo,
            homework5.totalScore,
            homework5.totalPossible,
            sections
          );
        } catch (error) {
          console.error('Failed to submit homework5 result:', error);
        }
      },

      // HW5 Getters
      getCurrentSection5: () => {
        const { homework5 } = get();
        return homework5.sections[homework5.currentSection];
      },

      getSectionProgress5: (sectionId: HW5SectionId) => {
        const { homework5 } = get();
        return homework5.sections[sectionId];
      },

      getOverallProgress5: () => {
        const { homework5 } = get();
        const sections = Object.values(homework5.sections);
        const completed = sections.filter(s => s.status === 'completed').length;
        return {
          completed,
          total: 6,
          percentage: Math.round((completed / 6) * 100),
        };
      },

      canAccessSection5: (_sectionId: HW5SectionId) => {
        return true;
      },

      isHomework5Complete: () => {
        const { homework5 } = get();
        return homework5.status === 'completed';
      },

      getAnswer5: (sectionId: HW5SectionId, questionId: string) => {
        const { homework5 } = get();
        return homework5.sections[sectionId].answers.find(a => a.questionId === questionId);
      },
    }),
    {
      name: 'koine-homework-store',
      version: 10, // Bump version for HW5 totalQuestions fix
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { homework2?: Homework2Progress; homework3?: Homework3Progress; homework4?: Homework4Progress; homework5?: Homework5Progress };

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

        // Add homework3 if missing (for users upgrading from version < 5)
        if (version < 5 && !state.homework3) {
          (state as { homework3: Homework3Progress }).homework3 = createInitialHomework3Progress();
        }

        // Add homework4 if missing (for users upgrading from version < 6)
        if (version < 6 && !state.homework4) {
          (state as { homework4: Homework4Progress }).homework4 = createInitialHomework4Progress();
        }

        // Update HW4 section question counts (for users upgrading from version < 7)
        if (version < 7 && state.homework4) {
          const hw4Counts: Record<number, number> = {
            1: 10, 2: 12, 3: 12, 4: 18, 5: 10
          };
          for (const [id, count] of Object.entries(hw4Counts)) {
            const sectionId = Number(id) as HW4SectionId;
            if (state.homework4.sections[sectionId]) {
              state.homework4.sections[sectionId].totalQuestions = count;
            }
          }
          state.homework4.totalPossible = 62;
        }

        // Add HW4 section 6 (verse translation) for users upgrading from version < 8
        if (version < 8 && state.homework4) {
          if (!state.homework4.sections[6 as HW4SectionId]) {
            state.homework4.sections[6 as HW4SectionId] = createInitialHW4SectionProgress(6 as HW4SectionId, 10);
          }
          state.homework4.totalPossible = 72;
        }

        // Add homework5 if missing (for users upgrading from version < 9)
        if (version < 9 && !state.homework5) {
          (state as { homework5: Homework5Progress }).homework5 = createInitialHomework5Progress();
        }

        // Fix HW5 section totalQuestions for users with stale persisted counts (version < 10)
        if (version < 10 && state.homework5) {
          const hw5Counts: Record<number, number> = {
            1: 12, 2: 16, 3: 16, 4: 22, 5: 14, 6: 10
          };
          for (const [id, count] of Object.entries(hw5Counts)) {
            const sectionId = Number(id) as HW5SectionId;
            if (state.homework5.sections[sectionId]) {
              state.homework5.sections[sectionId].totalQuestions = count;
            }
          }
          state.homework5.totalPossible = 90;
        }

        return state as HomeworkState;
      },
      partialize: (state) => ({
        homework1: state.homework1,
        homework2: state.homework2,
        homework3: state.homework3,
        homework4: state.homework4,
        homework5: state.homework5,
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
        useHomeworkStore.getState().resetHomework3();
        useHomeworkStore.getState().resetHomework4();
        useHomeworkStore.getState().resetHomework5();
      }
      previousUser = currentUser;
    });
  });
}
