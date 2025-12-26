import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStats, WordProgress, Achievement, SemanticCategory, PartOfSpeech } from '@/types';
import { createInitialStats, updateStreak, awardXP, calculateLevel } from '@/lib/xp';
import { createInitialProgress, updateWordProgress, isDue } from '@/lib/srs';
import { checkAchievements, ACHIEVEMENTS } from '@/lib/achievements';
import { sanitizeProgress, sanitizeUserStats, sanitizeStudyHistory, migrateLastReviewDate } from '@/lib/dataValidation';
import vocabularyData from '@/data/vocabulary.json';

// Snapshot of state before a review (for undo functionality)
interface ReviewSnapshot {
  wordId: string;
  stats: UserStats;
  wordProgress: WordProgress | null;
  todayReviews: number;
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
  // Daily goal (number of reviews)
  dailyGoal: number;
  // Session length (cards per session)
  sessionLength: number;
  // Today's review count
  todayReviews: number;
  // Last review date (for resetting daily count)
  lastReviewDate: string | null;
  // Whether daily goal XP has been awarded today (prevents race condition double-awards)
  dailyGoalAwardedToday: boolean;
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
  setDailyGoal: (goal: number) => void;
  setSessionLength: (length: number) => void;
  setSelectedTiers: (tiers: number[]) => void;
  setSelectedPOS: (pos: PartOfSpeech[]) => void;
  setSelectedCategories: (categories: SemanticCategory[]) => void;
  resetDailyCount: () => void;
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
      dailyGoalAwardedToday: false,
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
        let { stats, progress, todayReviews, lastReviewDate } = state;

        // Save snapshot for undo (deep copy stats and word progress)
        const snapshot: ReviewSnapshot = {
          wordId,
          stats: { ...stats, achievements: [...stats.achievements] },
          wordProgress: progress[wordId] ? { ...progress[wordId] } : null,
          todayReviews,
          timestamp: Date.now(),
        };

        // Check if we need to reset daily count and daily goal award flag
        // Use local timezone for date comparison (not UTC) to match user's day boundary
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        let dailyGoalAwardedToday = state.dailyGoalAwardedToday;
        if (lastReviewDate !== today) {
          todayReviews = 0;
          lastReviewDate = today;
          dailyGoalAwardedToday = false; // Reset daily goal award flag for new day
        }

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

        // Update review counts
        const newTodayReviews = todayReviews + 1;

        // Check if daily goal met (use flag to prevent race condition double-awards)
        if (newTodayReviews >= state.dailyGoal && !dailyGoalAwardedToday) {
          xpResult = awardXP(xpResult.newStats, 'dailyGoalMet');
          dailyGoalAwardedToday = true;
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
        // Reuse 'now' from above (already declared on line 169)
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
          todayReviews: newTodayReviews,
          lastReviewDate,
          dailyGoalAwardedToday,
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

        const { wordId, stats, wordProgress, todayReviews } = lastReviewSnapshot;

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
          todayReviews,
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

      setDailyGoal: (goal: number) => {
        set({ dailyGoal: Math.max(5, Math.min(100, goal)) });
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
    }),
    {
      name: 'koine-user-store',
      // Custom serialization for Date objects with data validation
      storage: {
        getItem: (name) => {
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

            // Migrate old date format for lastReviewDate
            if (data.state?.lastReviewDate) {
              data.state.lastReviewDate = migrateLastReviewDate(data.state.lastReviewDate);
            }

            // Sanitize study history
            if (data.state?.studyHistory) {
              data.state.studyHistory = sanitizeStudyHistory(data.state.studyHistory);
            }

            return data;
          } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const serialized = JSON.stringify(value);

            // Check quota before writing (rough estimate)
            const estimatedSize = serialized.length * 2; // UTF-16 chars = 2 bytes each
            const QUOTA_WARNING_THRESHOLD = 5 * 1024 * 1024; // 5MB

            if (estimatedSize > QUOTA_WARNING_THRESHOLD) {
              console.warn(`localStorage data approaching quota limit: ${(estimatedSize / 1024 / 1024).toFixed(2)}MB`);
            }

            localStorage.setItem(name, serialized);
          } catch (error) {
            if (error instanceof Error) {
              if (error.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded');
                // Try to clean up old backups to free space
                try {
                  const keysToRemove: string[] = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes('_corrupted_')) {
                      keysToRemove.push(key);
                    }
                  }
                  keysToRemove.forEach((key) => localStorage.removeItem(key));
                  console.log(`Cleaned up ${keysToRemove.length} old backup(s)`);

                  // Retry write after cleanup
                  localStorage.setItem(name, JSON.stringify(value));
                } catch (retryError) {
                  console.error('Failed to save even after cleanup:', retryError);
                  // TODO: Show user notification about storage full
                  throw retryError;
                }
              } else {
                console.error('Failed to save to localStorage:', error);
                throw error;
              }
            }
          }
        },
        removeItem: (name) => {
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
