'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, RotateCcw, ChevronRight, Eye, Trophy, ThumbsUp, Zap, Keyboard, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useQuestStore } from '@/stores/questStore';
import { useAuthStore } from '@/stores/authStore';
import { syncProgressToCloud } from '@/lib/firebase';
import { GreekWord } from '@/components/GreekWord';
import { TypingInput, TypingFeedback } from '@/components/TypingInput';
import { XPBar, XPGain } from '@/components/XPBar';
import { AchievementToast } from '@/components/AchievementToast';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, shuffle, checkTypingAnswer } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord, Achievement } from '@/types';

type AnswerStatus = 'idle' | 'correct' | 'incorrect' | 'close';

export default function TypingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { stats, progress, reviewWord, initializeWord, getDueWords, sessionLength, selectedTiers, selectedPOS, selectedCategories, checkAndUnlockAchievements, recordSession } = useUserStore();
  const {
    isActive,
    mode,
    startSession,
    endSession,
    words,
    currentIndex,
    showResult,
    typedAnswer,
    setTypedAnswer,
    submitTypedAnswer,
    nextWord,
    recordXP,
    getProgress,
    getSessionStats,
  } = useSessionStore();

  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('idle');
  const [showHint, setShowHint] = useState(false);
  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

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

    const currentProgressStr = JSON.stringify({ progress, stats });
    if (currentProgressStr === lastSyncedProgressRef.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

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
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to sync learning progress:', error);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    }, 30000);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, progress, stats, isActive]);

  useEffect(() => {
    if (!mounted) return;

    // If there's an active session from a different mode, end it first
    if (isActive && mode !== 'typing') {
      endSession();
      return; // The effect will re-run after endSession updates isActive
    }

    // If we already have an active typing session, just mark as initialized
    if (isActive && mode === 'typing') {
      setSessionInitialized(true);
      return;
    }

    if (!isActive) {
      // Get words for this session, filtered by selected tiers
      const dueWords = getDueWords();
      let sessionWords: VocabularyWord[] = [];

      // Filter function matching user's selected filters
      const matchesFilters = (w: VocabularyWord): boolean => {
        if (!selectedTiers.includes(w.tier)) return false;
        if (selectedPOS.length > 0 && !selectedPOS.includes(w.partOfSpeech)) return false;
        if (selectedCategories.length > 0) {
          const wordCategory = w.semanticCategory || 'general';
          if (!selectedCategories.includes(wordCategory)) return false;
        }
        return true;
      };

      if (dueWords.length > 0) {
        // Review due words first, filtered by selected tiers, POS, and categories
        const dueWordIds = dueWords.map((p) => p.wordId);
        sessionWords = vocabularyData.words.filter((w) =>
          dueWordIds.includes(w.id) && matchesFilters(w as VocabularyWord)
        ) as VocabularyWord[];
      }

      // If no due words in selected filters, learn new words
      if (sessionWords.length === 0) {
        const knownWordIds = Object.keys(progress);
        const newWords = vocabularyData.words.filter(
          (w) => !knownWordIds.includes(w.id) && matchesFilters(w as VocabularyWord)
        );
        sessionWords = newWords.sort((a, b) => a.tier - b.tier) as VocabularyWord[];
      }

      sessionWords = shuffle(sessionWords.slice(0, sessionLength));

      if (sessionWords.length > 0) {
        sessionWords.forEach((w) => initializeWord(w.id));
        startSession('typing', sessionWords);
      }

      setSessionInitialized(true);
    }
  }, [mounted, isActive, mode, getDueWords, progress, initializeWord, startSession, endSession, sessionLength, selectedTiers, selectedPOS, selectedCategories]);

  // Focus input when moving to next word
  useEffect(() => {
    if (!showResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showResult, currentIndex]);

  const currentWord = words[currentIndex] as VocabularyWord | undefined;
  const sessionProgress = getProgress();
  const sessionStats = getSessionStats();

  const checkAnswer = useCallback(() => {
    if (!currentWord || showResult) return;

    // Use the flexible answer checking
    const result = checkTypingAnswer(
      typedAnswer,
      currentWord.gloss,
      currentWord.definition
    );

    // Map result to status
    if (result === 'exact') {
      setAnswerStatus('correct');
    } else if (result === 'correct') {
      setAnswerStatus('correct');
    } else if (result === 'close') {
      setAnswerStatus('close');
    } else {
      setAnswerStatus('incorrect');
    }

    const isCorrect = result === 'exact' || result === 'correct' || result === 'close';
    submitTypedAnswer(isCorrect);

    // Update SRS and award XP
    // exact = 5, correct = 5, close = 3 (hard - partial credit), incorrect = 1
    const quality = result === 'exact' ? 5 : result === 'correct' ? 5 : result === 'close' ? 3 : 1;
    const { xpGained } = reviewWord(currentWord.id, quality);

    if (xpGained > 0) {
      setLastXP(xpGained);
      setShowXPGain(true);
      recordXP(xpGained);
    }
  }, [currentWord, showResult, typedAnswer, submitTypedAnswer, reviewWord, recordXP]);

  const handleNext = useCallback(() => {
    setAnswerStatus('idle');
    setShowHint(false);

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
  }, [currentIndex, words.length, nextWord, getSessionStats, checkAndUnlockAchievements]);

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

    // Final sync to cloud before exiting
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
    setAnswerStatus('idle');
    setShowHint(false);
    setSessionInitialized(false);
    endSession();
  };

  const handleShowHint = () => {
    setShowHint(true);
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if session is complete
      if (sessionComplete) {
        return;
      }

      // Enter to go to next word when showing result
      if (e.key === 'Enter' && showResult) {
        e.preventDefault();
        handleNext();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionComplete, showResult, handleNext]);

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
              <div className="flex justify-center mb-4">
                {sessionStats.accuracy >= 80 ? (
                  <Trophy className="w-16 h-16 text-amber-500" />
                ) : sessionStats.accuracy >= 60 ? (
                  <ThumbsUp className="w-16 h-16 text-blue-500" />
                ) : (
                  <Zap className="w-16 h-16 text-purple-500" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">Typing Practice Complete!</h2>
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
                  Practice More
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
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${sessionProgress.percentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start p-4">
        {/* XP indicator */}
        <div className="relative mb-6 w-full max-w-md">
          <XPBar xp={stats.xp} level={stats.level} showDetails={false} />
          <XPGain
            amount={lastXP}
            show={showXPGain}
            onComplete={() => setShowXPGain(false)}
          />
        </div>

        {/* Word card */}
        {currentWord && (
          <Card className="w-full max-w-md mb-6">
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Type the English translation
              </p>
              <GreekWord
                greek={currentWord.greek}
                transliteration={currentWord.transliteration}
                size="lg"
                showAudio
                className="mb-2"
              />
              <div className="flex justify-center gap-2 mt-2">
                <span
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    currentWord.tier === 1 &&
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                    currentWord.tier === 2 &&
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    currentWord.tier === 3 &&
                      'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                    currentWord.tier === 4 &&
                      'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    currentWord.tier === 5 &&
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  )}
                >
                  Tier {currentWord.tier}
                </span>
                <span className="text-xs text-muted-foreground py-1">
                  {currentWord.partOfSpeech}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Typing input */}
        {currentWord && (
          <div className="w-full max-w-md mb-4">
            <TypingInput
              ref={inputRef}
              value={typedAnswer}
              onChange={setTypedAnswer}
              onSubmit={checkAnswer}
              status={answerStatus}
              hint={
                answerStatus === 'close'
                  ? `Close! The exact answer is "${currentWord.gloss}"`
                  : undefined
              }
              placeholder="Type your answer..."
              disabled={showResult}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        )}

        {/* Hint section */}
        {!showResult && currentWord && (
          <div className="w-full max-w-md mb-4">
            {showHint ? (
              <div className="text-sm text-center py-2 space-y-2">
                <p className="text-muted-foreground">
                  First letter: <strong className="text-foreground">{currentWord.gloss[0].toUpperCase()}</strong>
                  {' '}&bull;{' '}
                  Length: <strong className="text-foreground">{currentWord.gloss.length}</strong> letters
                </p>
                <p className="text-xs text-muted-foreground">
                  Part of speech: <strong>{currentWord.partOfSpeech}</strong>
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Hint: &quot;{currentWord.gloss.slice(0, 2)}...{currentWord.gloss.slice(-1)}&quot;
                </p>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowHint}
                className="w-full text-muted-foreground"
                aria-label="Show hint for the answer"
              >
                <Eye className="w-4 h-4 mr-2" />
                Show Hint
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground/70 mt-2">
              Case-insensitive &bull; Accepts synonyms &bull; Partial credit for close answers
            </p>
          </div>
        )}

        {/* Feedback */}
        {showResult && currentWord && (
          <TypingFeedback
            status={answerStatus as 'correct' | 'incorrect' | 'close'}
            correctAnswer={currentWord.gloss}
            userAnswer={typedAnswer}
            className="w-full max-w-md mb-4"
          />
        )}

        {/* Definition (show after answer) */}
        {showResult && currentWord && (
          <p className="text-sm text-muted-foreground text-center w-full max-w-md mb-4">
            {currentWord.definition}
          </p>
        )}

        {/* Action button */}
        <div className="w-full max-w-md">
          {!showResult ? (
            <Button
              size="lg"
              className="w-full"
              disabled={!typedAnswer.trim()}
              onClick={checkAnswer}
            >
              Check Answer
            </Button>
          ) : (
            <Button size="lg" className="w-full" onClick={handleNext}>
              {currentIndex < words.length - 1 ? (
                <>
                  Next Word
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                'See Results'
              )}
            </Button>
          )}
        </div>

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
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">Enter</kbd> Submit answer</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">Enter</kbd> Next word</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Session stats footer */}
      <footer className="border-t bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="font-bold text-emerald-500">{sessionStats.correct}</div>
              <div className="text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-500">
                {sessionStats.total - sessionStats.correct}
              </div>
              <div className="text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{sessionStats.accuracy}%</div>
              <div className="text-muted-foreground">Accuracy</div>
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
      <main className="flex-1 flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-md h-40 bg-muted rounded-2xl mb-6" />
        <div className="w-full max-w-md h-14 bg-muted rounded-xl mb-4" />
        <div className="w-full max-w-md h-12 bg-muted rounded-lg" />
      </main>
    </div>
  );
}
