import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStats, WordProgress, Achievement, SemanticCategory, PartOfSpeech } from '@/types';
import { createInitialStats, updateStreak, awardXP, calculateLevel } from '@/lib/xp';
import { createInitialProgress, updateWordProgress, isDue } from '@/lib/srs';
import { checkAchievements, ACHIEVEMENTS } from '@/lib/achievements';
import { sanitizeProgress, sanitizeUserStats, sanitizeStudyHistory } from '@/lib/dataValidation';
import { getCommonNTVocabIds, COMMON_VOCAB_COUNT } from '@/lib/commonVocab';
import vocabularyData from '@/data/vocabulary.json';

// =============================================================================
// DEBOUNCED LOCALSTORAGE - Non-blocking writes for better UI performance
// =============================================================================
let pendingWrite: { name: string; value: unknown } | null = null;
let writeScheduled = false;

function scheduleWrite(name: string, value: unknown) {
  pendingWrite = { name, value };

  if (writeScheduled) return;
  writeScheduled = true;

  // Use requestIdleCallback for non-blocking writes, fallback to setTimeout
  const scheduleIdle = typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 50);

  scheduleIdle(() => {
    writeScheduled = false;
    if (!pendingWrite) return;

    const { name: n, value: v } = pendingWrite;
    pendingWrite = null;

    try {
      const serialized = JSON.stringify(v);
      localStorage.setItem(n, serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  });
}

// Snapshot of state before a review (for undo functionality)
interface ReviewSnapshot {
  wordId: string;
  stats: UserStats;
  wordProgress: WordProgress | null;
  timestamp: number;
}

// Daily study record for heatmap
interface DailyStudy {
  reviews: number;
  wordsLearned: number;
}

// Session history record
interface SessionRecord {
  id: string;
  mode: 'flashcard' | 'quiz' | 'typing' | 'translation';
  date: string; // ISO date string
  duration: number; // ms
  wordsReviewed: number;
  correctCount: number;
  accuracy: number;
  xpEarned: number;
  isPerfect: boolean;
}

// SRS scheduling mode presets
export type SRSMode = 'aggressive' | 'normal' | 'relaxed';

// SRS mode parameters (how intervals grow)
export const SRS_PRESETS: Record<SRSMode, { name: string; description: string; intervalModifier: number }> = {
  aggressive: {
    name: 'Aggressive',
    description: 'Shorter intervals, more reviews. Best for fast-paced learning.',
    intervalModifier: 0.8,
  },
  normal: {
    name: 'Normal',
    description: 'Standard SM-2 intervals. Balanced learning and retention.',
    intervalModifier: 1.0,
  },
  relaxed: {
    name: 'Relaxed',
    description: 'Longer intervals, fewer reviews. Best for maintenance.',
    intervalModifier: 1.3,
  },
};

export interface UserState {
  // User stats
  stats: UserStats;
  // Word progress keyed by word ID
  progress: Record<string, WordProgress>;
  // Session length (cards per session)
  sessionLength: number;
  // Selected vocabulary tiers for learning sessions
  selectedTiers: number[];
  // Selected parts of speech for filtering
  selectedPOS: PartOfSpeech[];
  // Selected semantic categories for filtering
  selectedCategories: SemanticCategory[];
  // Last review snapshot for undo
  lastReviewSnapshot: ReviewSnapshot | null;
  // Study history for heatmap (keyed by YYYY-MM-DD)
  studyHistory: Record<string, DailyStudy>;
  // Session history (last 30 sessions)
  sessionHistory: SessionRecord[];
  // SRS scheduling mode
  srsMode: SRSMode;
  // Blind review mode - hide answer until user thinks of it
  blindMode: boolean;

  // Actions
  initializeWord: (wordId: string) => void;
  reviewWord: (wordId: string, quality: number) => { xpGained: number; leveledUp: boolean };
  undoLastReview: () => boolean;
  canUndo: () => boolean;
  getWordProgress: (wordId: string) => WordProgress | null;
  getDueWords: () => WordProgress[];
  getLearnedWordsCount: () => number;
  getInProgressWordsCount: () => number;
  setSessionLength: (length: number) => void;
  setSelectedTiers: (tiers: number[]) => void;
  setSelectedPOS: (pos: PartOfSpeech[]) => void;
  setSelectedCategories: (categories: SemanticCategory[]) => void;
  unlockAchievement: (achievementId: string) => void;
  addXP: (amount: number) => { leveledUp: boolean };
  checkAndUnlockAchievements: (sessionStats?: { reviews: number; duration: number; isPerfect: boolean }) => Achievement[];
  getStudyHistory: () => Record<string, DailyStudy>;
  recordSession: (session: Omit<SessionRecord, 'id' | 'date'>) => void;
  getSessionHistory: () => SessionRecord[];
  setSrsMode: (mode: SRSMode) => void;
  getIntervalModifier: () => number;
  // Leech detection - words with high failure rate
  getLeeches: () => WordProgress[];
  isLeech: (wordId: string) => boolean;
  // Blind mode toggle
  setBlindMode: (enabled: boolean) => void;
  // Common NT Vocab progress
  getCommonVocabProgress: () => { learned: number; total: number; percentage: number };
}

// =============================================================================
// GRANULAR SELECTORS - Use these to avoid unnecessary re-renders
// =============================================================================
// These selectors subscribe only to specific slices of state, preventing
// cascading re-renders when unrelated state changes.

/** Select only user stats - use when you only need XP, level, streak, etc. */
export const useUserStats = () => useUserStore((state) => state.stats);

/** Select only the progress object */
export const useUserProgress = () => useUserStore((state) => state.progress);

/** Select only session length setting */
export const useSessionLength = () => useUserStore((state) => state.sessionLength);

/** Select only selected tiers */
export const useSelectedTiers = () => useUserStore((state) => state.selectedTiers);

/** Select only selected POS filters */
export const useSelectedPOS = () => useUserStore((state) => state.selectedPOS);

/** Select only selected category filters */
export const useSelectedCategories = () => useUserStore((state) => state.selectedCategories);

/** Select only SRS mode */
export const useSrsMode = () => useUserStore((state) => state.srsMode);

/** Select only blind mode setting */
export const useBlindMode = () => useUserStore((state) => state.blindMode);

/** Select only study history */
export const useStudyHistory = () => useUserStore((state) => state.studyHistory);

/** Select only session history */
export const useSessionHistory = () => useUserStore((state) => state.sessionHistory);

// =============================================================================
// Action-only selectors (no state, just actions - never cause re-renders)
// =============================================================================
export const useUserActions = () => useUserStore((state) => ({
  initializeWord: state.initializeWord,
  reviewWord: state.reviewWord,
  undoLastReview: state.undoLastReview,
  canUndo: state.canUndo,
  getWordProgress: state.getWordProgress,
  getDueWords: state.getDueWords,
  getLearnedWordsCount: state.getLearnedWordsCount,
  getInProgressWordsCount: state.getInProgressWordsCount,
  setSessionLength: state.setSessionLength,
  setSelectedTiers: state.setSelectedTiers,
  setSelectedPOS: state.setSelectedPOS,
  setSelectedCategories: state.setSelectedCategories,
  unlockAchievement: state.unlockAchievement,
  addXP: state.addXP,
  checkAndUnlockAchievements: state.checkAndUnlockAchievements,
  getStudyHistory: state.getStudyHistory,
  recordSession: state.recordSession,
  getSessionHistory: state.getSessionHistory,
  setSrsMode: state.setSrsMode,
  getIntervalModifier: state.getIntervalModifier,
  getLeeches: state.getLeeches,
  isLeech: state.isLeech,
  setBlindMode: state.setBlindMode,
  getCommonVocabProgress: state.getCommonVocabProgress,
}));

// =============================================================================
// MAIN STORE
// =============================================================================
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      stats: createInitialStats(),
      progress: {},
      sessionLength: 20,
      selectedTiers: [1, 2, 3, 4, 5], // All tiers selected by default
      selectedPOS: [], // Empty means "all" - no filtering
      selectedCategories: [], // Empty means "all" - no filtering
      lastReviewSnapshot: null,
      studyHistory: {},
      sessionHistory: [],
      srsMode: 'normal' as SRSMode,
      blindMode: false,

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
        let { stats, progress } = state;

        // Save snapshot for undo (deep copy stats and word progress)
        const snapshot: ReviewSnapshot = {
          wordId,
          stats: { ...stats, achievements: [...stats.achievements] },
          wordProgress: progress[wordId] ? { ...progress[wordId] } : null,
          timestamp: Date.now(),
        };

        // Get or create word progress
        let wordProgress = progress[wordId];
        const isNewWord = !wordProgress;

        if (!wordProgress) {
          wordProgress = createInitialProgress(wordId);
        }

        // Update word progress with SRS (using interval modifier from settings)
        const intervalModifier = SRS_PRESETS[state.srsMode].intervalModifier;
        const updatedProgress = updateWordProgress(wordProgress, quality, intervalModifier);

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

        // Update stats
        const newStats: UserStats = {
          ...xpResult.newStats,
          totalReviews: stats.totalReviews + 1,
          correctReviews: stats.correctReviews + (isCorrect ? 1 : 0),
          wordsLearned: isNewWord && isCorrect ? stats.wordsLearned + 1 : stats.wordsLearned,
          wordsInProgress: Object.values({
            ...progress,
            [wordId]: updatedProgress,
          }).filter((p) => p.timesReviewed > 0 && (p.maxRepetitions || p.repetitions) < 5).length,
        };

        // Update study history for heatmap (using local date, not UTC)
        const now = new Date();
        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const { studyHistory } = state;
        const todayHistory = studyHistory[todayKey] || { reviews: 0, wordsLearned: 0 };
        const newStudyHistory = {
          ...studyHistory,
          [todayKey]: {
            reviews: todayHistory.reviews + 1,
            wordsLearned: todayHistory.wordsLearned + (isNewWord && isCorrect ? 1 : 0),
          },
        };

        set({
          stats: newStats,
          progress: {
            ...progress,
            [wordId]: updatedProgress,
          },
          lastReviewSnapshot: snapshot,
          studyHistory: newStudyHistory,
        });

        return {
          xpGained: xpResult.xpGained,
          leveledUp: xpResult.leveledUp,
        };
      },

      undoLastReview: () => {
        const { lastReviewSnapshot, progress } = get();

        // Can only undo within 30 seconds
        if (!lastReviewSnapshot || Date.now() - lastReviewSnapshot.timestamp > 30000) {
          return false;
        }

        const { wordId, stats, wordProgress } = lastReviewSnapshot;

        // Restore the previous state
        const newProgress = { ...progress };
        if (wordProgress === null) {
          // Word didn't exist before, remove it
          delete newProgress[wordId];
        } else {
          // Restore previous word progress
          newProgress[wordId] = wordProgress;
        }

        set({
          stats,
          progress: newProgress,
          lastReviewSnapshot: null, // Clear snapshot after undo
        });

        return true;
      },

      canUndo: () => {
        const { lastReviewSnapshot } = get();
        return lastReviewSnapshot !== null && Date.now() - lastReviewSnapshot.timestamp <= 30000;
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
        // Words are "learned" if they ever reached 5 repetitions (maxRepetitions tracks this permanently)
        return Object.values(progress).filter((p) => (p.maxRepetitions || p.repetitions) >= 5).length;
      },

      getInProgressWordsCount: () => {
        const { progress } = get();
        // "In progress" means started but not yet learned (maxRepetitions < 5)
        return Object.values(progress).filter(
          (p) => p.timesReviewed > 0 && (p.maxRepetitions || p.repetitions) < 5
        ).length;
      },

      setSessionLength: (length: number) => {
        set({ sessionLength: Math.max(5, Math.min(50, length)) });
      },

      setSelectedTiers: (tiers: number[]) => {
        // Ensure at least one tier is selected
        if (tiers.length === 0) {
          set({ selectedTiers: [1] });
        } else {
          set({ selectedTiers: tiers.filter(t => t >= 1 && t <= 5) });
        }
      },

      setSelectedPOS: (pos: PartOfSpeech[]) => {
        // Empty array means "all" - no filtering
        set({ selectedPOS: pos });
      },

      setSelectedCategories: (categories: SemanticCategory[]) => {
        // Empty array means "all" - no filtering
        set({ selectedCategories: categories });
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

      checkAndUnlockAchievements: (sessionStats) => {
        const state = get();
        const { stats, progress } = state;

        // Calculate tier progress for tier mastery achievements
        const tierProgress: Record<number, { learned: number; total: number }> = {};
        [1, 2, 3, 4, 5].forEach((tier) => {
          const tierWords = vocabularyData.words.filter((w) => w.tier === tier);
          const tierWordIds = new Set(tierWords.map((w) => w.id));
          const learnedInTier = Object.values(progress).filter(
            (p) => tierWordIds.has(p.wordId) && (p.maxRepetitions || p.repetitions) >= 5
          ).length;
          tierProgress[tier] = { learned: learnedInTier, total: tierWords.length };
        });

        // Check which achievements have been earned
        const newlyEarned = checkAchievements(stats, {
          tierProgress,
          sessionStats,
        });

        // Unlock each newly earned achievement and award XP
        if (newlyEarned.length > 0) {
          let totalXPBonus = 0;
          const newAchievementIds: string[] = [];

          newlyEarned.forEach((achievement) => {
            totalXPBonus += achievement.xpBonus;
            newAchievementIds.push(achievement.id);
          });

          // Update stats with new achievements and XP
          const newXP = stats.xp + totalXPBonus;
          const newLevel = calculateLevel(newXP);

          set({
            stats: {
              ...stats,
              xp: newXP,
              level: newLevel,
              achievements: [...stats.achievements, ...newAchievementIds],
            },
          });
        }

        return newlyEarned;
      },

      getStudyHistory: () => {
        return get().studyHistory;
      },

      recordSession: (session) => {
        const { sessionHistory } = get();
        const newRecord: SessionRecord = {
          ...session,
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
        };

        // Keep last 30 sessions
        const newHistory = [newRecord, ...sessionHistory].slice(0, 30);
        set({ sessionHistory: newHistory });
      },

      getSessionHistory: () => {
        return get().sessionHistory;
      },

      setSrsMode: (mode: SRSMode) => {
        set({ srsMode: mode });
      },

      getIntervalModifier: () => {
        const { srsMode } = get();
        return SRS_PRESETS[srsMode].intervalModifier;
      },

      // Leech detection: words reviewed 8+ times with < 50% accuracy
      getLeeches: () => {
        const { progress } = get();
        return Object.values(progress).filter((p) => {
          if (p.timesReviewed < 8) return false;
          // Ensure valid accuracy calculation (handle potential data corruption)
          const timesCorrect = Math.min(p.timesCorrect, p.timesReviewed);
          const accuracy = timesCorrect / p.timesReviewed;
          return accuracy < 0.5;
        });
      },

      isLeech: (wordId: string) => {
        const { progress } = get();
        const p = progress[wordId];
        if (!p || p.timesReviewed < 8) return false;
        // Ensure valid accuracy calculation (handle potential data corruption)
        const timesCorrect = Math.min(p.timesCorrect, p.timesReviewed);
        const accuracy = timesCorrect / p.timesReviewed;
        return accuracy < 0.5;
      },

      setBlindMode: (enabled: boolean) => {
        set({ blindMode: enabled });
      },

      getCommonVocabProgress: () => {
        const { progress } = get();
        const commonIds = getCommonNTVocabIds();
        // A word is "learned" if it has been reviewed at least once (repetitions >= 1)
        const learned = Object.values(progress).filter(
          (p) => commonIds.has(p.wordId) && p.repetitions >= 1
        ).length;
        const percentage = Math.round((learned / COMMON_VOCAB_COUNT) * 100);
        return { learned, total: COMMON_VOCAB_COUNT, percentage };
      },
    }),
    {
      name: 'koine-user-store',
      // Custom serialization for Date objects with data validation
      storage: {
        getItem: (name) => {
          // Check if we're in a browser environment
          if (typeof window === 'undefined') return null;
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;

            let data;
            try {
              data = JSON.parse(str);
            } catch (parseError) {
              console.error('Failed to parse localStorage data:', parseError);
              // Try to backup corrupted data before returning null
              try {
                const backupKey = `${name}_corrupted_${Date.now()}`;
                localStorage.setItem(backupKey, str);
                console.log(`Corrupted data backed up to: ${backupKey}`);
              } catch (backupError) {
                console.error('Failed to backup corrupted data:', backupError);
              }
              return null;
            }

            // Validate basic structure
            if (!data || typeof data !== 'object' || !data.state) {
              console.error('Invalid localStorage structure, resetting');
              return null;
            }

            // Convert date strings back to Date objects and sanitize data
            if (data.state?.progress) {
              Object.values(data.state.progress as Record<string, WordProgress>).forEach((p) => {
                if (p.nextReview) p.nextReview = new Date(p.nextReview);
                if (p.lastReview) p.lastReview = new Date(p.lastReview);
              });
              // Sanitize progress data to fix any corrupted values
              data.state.progress = sanitizeProgress(data.state.progress);
            }

            if (data.state?.stats) {
              if (data.state.stats.lastStudyDate) {
                data.state.stats.lastStudyDate = new Date(data.state.stats.lastStudyDate);
              }
              // Sanitize stats to fix any corrupted values
              data.state.stats = sanitizeUserStats(data.state.stats);
            }

            // Sanitize study history
            if (data.state?.studyHistory) {
              data.state.studyHistory = sanitizeStudyHistory(data.state.studyHistory);
            }

            // Clean up removed fields from old localStorage data (daily quests feature was removed)
            if (data.state) {
              delete data.state.dailyGoal;
              delete data.state.todayReviews;
              delete data.state.lastReviewDate;
              delete data.state.dailyGoalAwardedToday;
            }

            return data;
          } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          // Check if we're in a browser environment
          if (typeof window === 'undefined') return;

          // Use debounced write for non-blocking UI
          // This batches rapid writes and uses requestIdleCallback
          scheduleWrite(name, value);
        },
        removeItem: (name) => {
          // Check if we're in a browser environment
          if (typeof window === 'undefined') return;
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('Failed to remove from localStorage:', error);
          }
        },
      },
    }
  )
);
