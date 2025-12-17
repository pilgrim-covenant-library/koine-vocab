'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, RotateCcw, Keyboard, Undo2, Eye, EyeOff } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useQuestStore } from '@/stores/questStore';
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
  const { stats, progress, reviewWord, undoLastReview, canUndo, initializeWord, getWordProgress, getDueWords, sessionLength, selectedTiers, checkAndUnlockAchievements, recordSession, getIntervalModifier, blindMode, setBlindMode } =
    useUserStore();
  const {
    isActive,
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

  // Initialize session on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isActive) {
      // Get words for this session, filtered by selected tiers
      const dueWords = getDueWords();
      let sessionWords: VocabularyWord[] = [];

      if (dueWords.length > 0) {
        // Review due words first, filtered by selected tiers
        const dueWordIds = dueWords.map((p) => p.wordId);
        sessionWords = vocabularyData.words.filter((w) =>
          dueWordIds.includes(w.id) && selectedTiers.includes(w.tier)
        ) as VocabularyWord[];
      }

      // If no due words in selected tiers, learn new words
      if (sessionWords.length === 0) {
        // Learn new words - get words not yet in progress, filtered by selected tiers
        const knownWordIds = Object.keys(progress);
        const newWords = vocabularyData.words.filter(
          (w) => !knownWordIds.includes(w.id) && selectedTiers.includes(w.tier)
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
  }, [mounted, isActive, getDueWords, progress, initializeWord, startSession, sessionLength, selectedTiers]);

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

  const handleEndSession = () => {
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

  // No words available
  if (!isActive && words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <h2 className="text-2xl font-bold mb-4">All caught up!</h2>
            <p className="text-muted-foreground mb-6">
              You have no words due for review. Great job staying on top of your studies!
            </p>
            <Button onClick={() => router.push('/')}>Back to Dashboard</Button>
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
            <div className="w-10" /> {/* Spacer for layout balance */}
            <span className="text-sm font-medium">
              {sessionProgress.current} / {sessionProgress.total}
            </span>
            <Button variant="ghost" size="icon" onClick={handleEndSession} aria-label="Exit session">
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${sessionProgress.percentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
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
            <div className="flex gap-6 text-sm">
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
