'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, RotateCcw, Keyboard, Undo2, Eye, EyeOff, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useQuestStore } from '@/stores/questStore';
import { useAuthStore } from '@/stores/authStore';
import { syncProgressToCloud } from '@/lib/firebase';
import { FlashCard } from '@/components/FlashCard';
import { ReviewButtons } from '@/components/ReviewButtons';
import { XPBar, XPGain } from '@/components/XPBar';
import { AchievementToast } from '@/components/AchievementToast';
import { StreakCounter } from '@/components/StreakCounter';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { shuffle } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord, Achievement } from '@/types';

// Keyboard shortcut mappings
const KEYBOARD_SHORTCUTS = {
  '1': 1, // Again
  '2': 3, // Hard
  '3': 4, // Good
  '4': 5, // Easy
} as const;

export default function FlashcardsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, progress, reviewWord, undoLastReview, canUndo, initializeWord, getWordProgress, getDueWords, sessionLength, selectedTiers, selectedPOS, selectedCategories, checkAndUnlockAchievements, recordSession, getIntervalModifier, blindMode, setBlindMode } =
    useUserStore();
  const {
    isActive,
    mode,
    startSession,
    endSession,
    words,
    currentIndex,
    isFlipped,
    flipCard,
    nextWord,
    recordXP,
    getProgress,
    getSessionStats,
    undoLastReview: undoSessionReview,
  } = useSessionStore();

  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimeLeft, setUndoTimeLeft] = useState(0);

  // Cloud sync state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedProgressRef = useRef<string>('');

  // Initialize session on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced cloud sync for learning progress
  useEffect(() => {
    if (!user || !isActive) return;

    // Convert progress to JSON string for comparison
    const currentProgressStr = JSON.stringify({ progress, stats });

    // Only sync if progress has actually changed
    if (currentProgressStr === lastSyncedProgressRef.current) {
      return;
    }

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Set new timeout for debounced sync (30 seconds for batching)
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        await syncProgressToCloud(user.uid, {
          words: progress,
          stats,
          lastSynced: new Date(),
        });
        lastSyncedProgressRef.current = currentProgressStr;
        setSyncStatus('synced');

        // Reset to idle after 2 seconds
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to sync learning progress:', error);
        setSyncStatus('error');

        // Reset to idle after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    }, 30000); // 30 second debounce for batching

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, progress, stats, isActive]);

  useEffect(() => {
    if (!mounted) return;

    // If there's an active session from a different mode, end it first
    if (isActive && mode !== 'flashcard') {
      endSession();
      return; // The effect will re-run after endSession updates isActive
    }

    // If we already have an active flashcard session, just mark as initialized
    if (isActive && mode === 'flashcard') {
      setSessionInitialized(true);
      return;
    }

    if (!isActive) {
      // Filter function for tier, POS, and category
      const matchesFilters = (w: VocabularyWord): boolean => {
        // Tier filter (always applied)
        if (!selectedTiers.includes(w.tier)) return false;

        // POS filter (only if selections exist)
        if (selectedPOS.length > 0 && !selectedPOS.includes(w.partOfSpeech)) return false;

        // Category filter (only if selections exist)
        if (selectedCategories.length > 0) {
          const wordCategory = w.semanticCategory || 'general';
          if (!selectedCategories.includes(wordCategory)) return false;
        }

        return true;
      };

      // Get words for this session, filtered by selected tiers/POS/categories
      const dueWords = getDueWords();
      let sessionWords: VocabularyWord[] = [];

      if (dueWords.length > 0) {
        // Review due words first, filtered by selected criteria
        const dueWordIds = dueWords.map((p) => p.wordId);
        sessionWords = vocabularyData.words.filter((w) =>
          dueWordIds.includes(w.id) && matchesFilters(w as VocabularyWord)
        ) as VocabularyWord[];
      }

      // If no due words matching filters, learn new words
      if (sessionWords.length === 0) {
        // Learn new words - get words not yet in progress, filtered by selected criteria
        const knownWordIds = Object.keys(progress);
        const newWords = vocabularyData.words.filter(
          (w) => !knownWordIds.includes(w.id) && matchesFilters(w as VocabularyWord)
        );
        // Sort by tier (learn easier words first)
        sessionWords = newWords.sort((a, b) => a.tier - b.tier) as VocabularyWord[];
      }

      // Limit and shuffle
      sessionWords = shuffle(sessionWords.slice(0, sessionLength));

      if (sessionWords.length > 0) {
        // Initialize progress for new words
        sessionWords.forEach((w) => initializeWord(w.id));
        startSession('flashcard', sessionWords);
      }

      setSessionInitialized(true);
    }
  }, [mounted, isActive, mode, getDueWords, progress, initializeWord, startSession, endSession, sessionLength, selectedTiers, selectedPOS, selectedCategories]);

  const currentWord = words[currentIndex] as VocabularyWord | undefined;
  const currentProgress = currentWord ? getWordProgress(currentWord.id) : null;
  const sessionProgress = getProgress();
  const sessionStats = getSessionStats();

  const handleRate = useCallback(
    (quality: number) => {
      if (!currentWord) return;

      // Review the word and get XP
      const { xpGained, leveledUp } = reviewWord(currentWord.id, quality);

      // Show XP gain animation and record in session
      if (xpGained > 0) {
        setLastXP(xpGained);
        setShowXPGain(true);
        recordXP(xpGained);
      }

      // Show undo button for 5 seconds
      setShowUndo(true);
      setUndoTimeLeft(5);

      // Move to next word or end session
      if (currentIndex < words.length - 1) {
        nextWord();
      } else {
        // Session complete - check for achievements
        const stats = getSessionStats();
        const sessionData = {
          reviews: stats.total,
          duration: Date.now() - (useSessionStore.getState().startTime || Date.now()),
          isPerfect: stats.accuracy === 100,
        };
        const newAchievements = checkAndUnlockAchievements(sessionData);
        if (newAchievements.length > 0) {
          setUnlockedAchievements(newAchievements);
        }
        setSessionComplete(true);
      }
    },
    [currentWord, currentIndex, words.length, reviewWord, nextWord, recordXP, getSessionStats, checkAndUnlockAchievements]
  );

  // Undo countdown timer
  useEffect(() => {
    if (!showUndo || undoTimeLeft <= 0) {
      if (undoTimeLeft <= 0) setShowUndo(false);
      return;
    }

    const timer = setTimeout(() => {
      setUndoTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showUndo, undoTimeLeft]);

  const handleUndo = useCallback(() => {
    // Undo in user store (reverts SRS progress)
    if (undoLastReview()) {
      // Also undo in session store (restores card index and removes review from session)
      undoSessionReview();

      // If session was completed, un-complete it
      if (sessionComplete) {
        setSessionComplete(false);
      }

      setShowUndo(false);
      setUndoTimeLeft(0);
    }
  }, [undoLastReview, undoSessionReview, sessionComplete]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or if session is complete
      if (sessionComplete || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Z key to undo (Ctrl+Z or just Z)
      if ((e.key === 'z' || e.key === 'Z') && showUndo) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Space or Enter to flip card
      if ((e.key === ' ' || e.key === 'Enter') && !isFlipped) {
        e.preventDefault();
        flipCard();
        return;
      }

      // Number keys 1-4 to rate (only when card is flipped)
      if (isFlipped && e.key in KEYBOARD_SHORTCUTS) {
        e.preventDefault();
        const quality = KEYBOARD_SHORTCUTS[e.key as keyof typeof KEYBOARD_SHORTCUTS];
        handleRate(quality);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, sessionComplete, flipCard, handleRate, showUndo, handleUndo]);

  const { recordReviewCount, recordSessionAccuracy, recordPerfectSession } = useQuestStore();

  const handleEndSession = async () => {
    const summary = endSession();

    // Record session history
    if (summary.wordsReviewed > 0) {
      recordSession({
        mode: summary.mode,
        duration: summary.duration,
        wordsReviewed: summary.wordsReviewed,
        correctCount: summary.correctCount,
        accuracy: summary.accuracy,
        xpEarned: summary.xpEarned,
        isPerfect: summary.isPerfect,
      });

      // Update quest progress
      recordReviewCount(summary.wordsReviewed);
      recordSessionAccuracy(summary.accuracy);
      if (summary.isPerfect) {
        recordPerfectSession();
      }
    }

    // Final sync to cloud before exiting (immediate, no debounce)
    if (user && summary.wordsReviewed > 0) {
      try {
        setSyncStatus('syncing');
        await syncProgressToCloud(user.uid, {
          words: progress,
          stats,
          lastSynced: new Date(),
        });
        setSyncStatus('synced');
      } catch (error) {
        console.error('Failed final sync on session end:', error);
        setSyncStatus('error');
      }
    }

    router.push('/');
  };

  const handleRestart = () => {
    setSessionComplete(false);
    setSessionInitialized(false);
    endSession();
    // Session will reinitialize on next render
  };

  if (!mounted || !sessionInitialized) {
    return <LoadingSkeleton />;
  }

  // No words available - determine the reason
  if (!isActive && words.length === 0) {
    const allDueWords = getDueWords();
    const hasWordsInOtherTiers = allDueWords.length > 0;
    const hasAnyProgress = Object.keys(progress).length > 0;

    let title = "All caught up!";
    let message = "You have no words due for review. Great job staying on top of your studies!";
    let actionText = "Back to Dashboard";
    let actionHref = "/";

    if (hasWordsInOtherTiers) {
      // User has due words but not in selected tiers
      title = "No words in selected tiers";
      message = `You have ${allDueWords.length} words due for review in other tiers. Adjust your tier selection in Settings to include them.`;
      actionText = "Adjust Settings";
      actionHref = "/settings";
    } else if (!hasAnyProgress) {
      // New user with no progress
      title = "Ready to start learning?";
      message = "Select your tier preferences in Settings and begin your Greek vocabulary journey!";
      actionText = "Get Started";
      actionHref = "/learn";
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/')}>Dashboard</Button>
              <Button onClick={() => router.push(actionHref)}>{actionText}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session complete
  if (sessionComplete) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="py-8 text-center">
              <div className="text-6xl mb-4">
                {sessionStats.accuracy >= 80 ? '🎉' : sessionStats.accuracy >= 60 ? '👍' : '💪'}
              </div>
              <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
              <div className="space-y-2 mb-6">
                <p className="text-lg">
                  <span className="font-bold text-primary">{sessionStats.correct}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    / {sessionStats.total} correct
                  </span>
                </p>
                <p className="text-3xl font-bold text-purple-500">{sessionStats.accuracy}%</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRestart} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Study More
                </Button>
                <Button onClick={handleEndSession} className="flex-1">
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {unlockedAchievements.length > 0 && (
          <AchievementToast
            achievements={unlockedAchievements}
            onDismiss={() => setUnlockedAchievements([])}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            {/* Sync status indicator */}
            <div className="w-10 flex items-center justify-start">
              {user && syncStatus !== 'idle' && (
                <div className="flex items-center gap-1" title={
                  syncStatus === 'syncing' ? 'Saving to cloud...' :
                  syncStatus === 'synced' ? 'Saved to cloud' :
                  'Sync failed - data saved locally'
                }>
                  {syncStatus === 'syncing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                  {syncStatus === 'synced' && <Cloud className="w-3.5 h-3.5 text-green-500" />}
                  {syncStatus === 'error' && <CloudOff className="w-3.5 h-3.5 text-orange-500" />}
                </div>
              )}
            </div>
            <span className="text-sm font-medium">
              {sessionProgress.current} / {sessionProgress.total}
            </span>
            <Button variant="ghost" size="icon" onClick={handleEndSession} aria-label="Exit session">
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-muted/50 dark:bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${sessionProgress.percentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center p-4" aria-live="polite">
        {/* XP indicator */}
        <div className="relative mb-4 w-full max-w-md">
          <XPBar xp={stats.xp} level={stats.level} showDetails={false} />
          <XPGain
            amount={lastXP}
            show={showXPGain}
            onComplete={() => setShowXPGain(false)}
          />
        </div>

        {/* Undo button */}
        {showUndo && (
          <button
            onClick={handleUndo}
            className="mb-4 px-4 py-2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium flex items-center gap-2 transition-opacity hover:bg-amber-200 dark:hover:bg-amber-800"
          >
            <Undo2 className="w-4 h-4" />
            Undo ({undoTimeLeft}s)
            <span className="hidden sm:inline text-xs opacity-70">(Z)</span>
          </button>
        )}

        {/* Blind Mode Toggle */}
        <button
          onClick={() => setBlindMode(!blindMode)}
          className={cn(
            'mb-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors',
            blindMode
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          aria-label={blindMode ? 'Disable blind review mode' : 'Enable blind review mode'}
        >
          {blindMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {blindMode ? 'Blind Mode On' : 'Blind Mode'}
        </button>

        {/* Flashcard */}
        {currentWord && (
          <FlashCard
            word={currentWord}
            isFlipped={isFlipped}
            onFlip={flipCard}
            className="mb-6"
            blindMode={blindMode}
          />
        )}

        {/* Review buttons (only show when flipped) */}
        {isFlipped && (
          <ReviewButtons
            onRate={handleRate}
            progress={currentProgress}
            intervalModifier={getIntervalModifier()}
            className="w-full max-w-md"
          />
        )}

        {/* Tap hint (when not flipped) */}
        {!isFlipped && (
          <p className="text-sm text-muted-foreground text-center">
            Tap the card to see the answer
            <span className="hidden sm:inline text-xs ml-2 opacity-70">
              (or press Space)
            </span>
          </p>
        )}

        {/* Keyboard shortcuts hint (desktop only) */}
        <div className="hidden sm:block mt-4">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <Keyboard className="w-3 h-3" />
            Keyboard shortcuts
          </button>
          {showShortcuts && (
            <div className="mt-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground max-w-xs mx-auto">
              <div className="grid grid-cols-2 gap-2">
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">Space</kbd> Flip card</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">1</kbd> Again</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">2</kbd> Hard</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">3</kbd> Good</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">4</kbd> Easy</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">Z</kbd> Undo</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Session stats footer */}
      <footer className="border-t bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <StreakCounter
              currentStreak={sessionStats.currentStreak}
              bestStreak={sessionStats.bestStreak}
            />
            <div className="flex gap-4 sm:gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-emerald-500">{sessionStats.correct}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-500">
                  {sessionStats.total - sessionStats.correct}
                </div>
                <div className="text-xs text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="font-bold">{sessionStats.accuracy}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      <header className="border-b p-4">
        <div className="h-8 bg-muted rounded" />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md h-72 bg-muted rounded-2xl" />
      </main>
    </div>
  );
}
