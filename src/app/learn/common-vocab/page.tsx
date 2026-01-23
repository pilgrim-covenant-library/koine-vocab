'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, RotateCcw, ChevronRight, Trophy, ThumbsUp, Zap, Keyboard, Cloud, CloudOff, Loader2, Crown } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';
import { syncProgressToCloud } from '@/lib/firebase';
import { getCommonNTVocab } from '@/lib/commonVocab';
import { GreekWord } from '@/components/GreekWord';
import { QuizOption } from '@/components/QuizOption';
import { XPBar, XPGain } from '@/components/XPBar';
import { AchievementToast } from '@/components/AchievementToast';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, shuffle } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord, QuizQuestion, Achievement } from '@/types';

function generateQuizQuestion(
  word: VocabularyWord,
  allWords: VocabularyWord[]
): QuizQuestion {
  if (!word || !word.gloss || !Array.isArray(allWords) || allWords.length === 0) {
    return {
      word: word || { id: '', greek: '', transliteration: '', gloss: 'Unknown', definition: '', partOfSpeech: 'noun', frequency: 0, tier: 1, strongs: '' } as VocabularyWord,
      options: [word?.gloss || 'Unknown', 'Option A', 'Option B', 'Option C'],
      correctIndex: 0,
    };
  }

  const allGlosses = new Set(allWords.map((w) => w.gloss));
  allGlosses.delete(word.gloss);

  const sameOrAdjacentTier = allWords.filter(
    (w) =>
      w.id !== word.id &&
      Math.abs(w.tier - word.tier) <= 1 &&
      w.gloss !== word.gloss
  );

  const usedGlosses = new Set<string>();
  const distractors: string[] = [];

  const shuffledSameTier = shuffle([...sameOrAdjacentTier]);
  for (const w of shuffledSameTier) {
    if (!usedGlosses.has(w.gloss) && distractors.length < 3) {
      usedGlosses.add(w.gloss);
      distractors.push(w.gloss);
    }
  }

  if (distractors.length < 3) {
    const otherWords = allWords.filter(
      (w) =>
        w.id !== word.id &&
        w.gloss !== word.gloss &&
        !usedGlosses.has(w.gloss)
    );
    const shuffledOther = shuffle([...otherWords]);
    for (const w of shuffledOther) {
      if (!usedGlosses.has(w.gloss) && distractors.length < 3) {
        usedGlosses.add(w.gloss);
        distractors.push(w.gloss);
      }
    }
  }

  const fallbackOptions = ['(unknown)', '(not listed)', '(other meaning)'];
  let fallbackIndex = 0;
  while (distractors.length < 3 && fallbackIndex < fallbackOptions.length) {
    const fallback = fallbackOptions[fallbackIndex];
    if (!usedGlosses.has(fallback)) {
      distractors.push(fallback);
    }
    fallbackIndex++;
  }

  const options = shuffle([word.gloss, ...distractors]);
  const correctIndex = options.indexOf(word.gloss);

  return {
    word,
    options,
    correctIndex,
  };
}

export default function CommonVocabQuizPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats, progress, reviewWord, initializeWord, sessionLength, checkAndUnlockAchievements, recordSession } = useUserStore();
  const {
    isActive,
    mode,
    startSession,
    endSession,
    words,
    currentIndex,
    showResult,
    selectedAnswer,
    selectAnswer,
    submitQuizAnswer,
    nextWord,
    recordXP,
    getProgress,
    getSessionStats,
  } = useSessionStore();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track sync state with a simple counter instead of expensive JSON.stringify comparison
  const lastSyncedVersionRef = useRef<number>(0);
  const currentVersionRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced cloud sync for learning progress
  // Uses version counter instead of expensive JSON.stringify comparison
  useEffect(() => {
    if (!user || !isActive) return;

    // Only sync if version has changed (incremented on each review)
    if (currentVersionRef.current === lastSyncedVersionRef.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    const versionToSync = currentVersionRef.current;

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        await syncProgressToCloud(user.uid, {
          words: progress,
          stats,
          lastSynced: new Date(),
        });
        lastSyncedVersionRef.current = versionToSync;
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

    if (isActive && mode !== 'quiz') {
      endSession();
      return;
    }

    if (isActive && mode === 'quiz') {
      if (words.length > 0 && questions.length === 0) {
        const allWords = vocabularyData.words as VocabularyWord[];
        const generatedQuestions = words.map((word) =>
          generateQuizQuestion(word, allWords)
        );
        setQuestions(generatedQuestions);
      }
      setSessionInitialized(true);
      return;
    }

    if (!isActive) {
      // Get the common NT vocabulary (top 100 by frequency)
      const commonVocab = getCommonNTVocab();

      // Find words not yet learned (no progress or low repetitions)
      const notYetLearned = commonVocab.filter((word) => {
        const wordProgress = progress[word.id];
        return !wordProgress || wordProgress.repetitions < 1;
      });

      // Also get words that are due for review
      const dueForReview = commonVocab.filter((word) => {
        const wordProgress = progress[word.id];
        if (!wordProgress) return false;
        const now = new Date();
        return new Date(wordProgress.nextReview) <= now;
      });

      // Prioritize: due words first, then new words
      let sessionWords: VocabularyWord[] = [];

      if (dueForReview.length > 0) {
        sessionWords = [...dueForReview];
      }

      // Fill remaining slots with new words (if we have room)
      const remainingSlots = sessionLength - sessionWords.length;
      if (remainingSlots > 0 && notYetLearned.length > 0) {
        // Sort new words by frequency (most common first)
        const sortedNewWords = notYetLearned.sort((a, b) => b.frequency - a.frequency);
        sessionWords = [...sessionWords, ...sortedNewWords.slice(0, remainingSlots)];
      }

      // Shuffle and limit to session length
      sessionWords = shuffle(sessionWords.slice(0, sessionLength));

      if (sessionWords.length > 0) {
        sessionWords.forEach((w) => initializeWord(w.id));

        const allWords = vocabularyData.words as VocabularyWord[];
        const generatedQuestions = sessionWords.map((word) =>
          generateQuizQuestion(word, allWords)
        );
        setQuestions(generatedQuestions);

        startSession('quiz', sessionWords);
      }

      setSessionInitialized(true);
    }
  }, [mounted, isActive, mode, words, questions.length, progress, initializeWord, startSession, endSession, sessionLength]);

  const currentQuestion = questions[currentIndex];
  const sessionProgress = getProgress();
  const sessionStats = getSessionStats();

  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (showResult || !currentQuestion) return;
      selectAnswer(index);
    },
    [showResult, currentQuestion, selectAnswer]
  );

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null || !currentQuestion) return;

    if (selectedAnswer < 0 || selectedAnswer >= currentQuestion.options.length) {
      console.error('Invalid answer index:', selectedAnswer);
      return;
    }

    // Increment version counter for cloud sync tracking (avoids expensive JSON.stringify)
    currentVersionRef.current += 1;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    submitQuizAnswer(isCorrect);

    const quality = isCorrect ? 5 : 1;
    const { xpGained } = reviewWord(currentQuestion.word.id, quality);

    if (xpGained > 0) {
      setLastXP(xpGained);
      setShowXPGain(true);
      recordXP(xpGained);
    }
  }, [selectedAnswer, currentQuestion, submitQuizAnswer, reviewWord, recordXP]);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      nextWord();
    } else {
      // Capture startTime BEFORE ending session to avoid race condition
      const sessionStartTime = useSessionStore.getState().startTime;
      const sessionStatsData = getSessionStats();
      const sessionData = {
        reviews: sessionStatsData.total,
        duration: sessionStartTime ? Date.now() - sessionStartTime : 0,
        isPerfect: sessionStatsData.accuracy === 100,
      };
      const newAchievements = checkAndUnlockAchievements(sessionData);
      if (newAchievements.length > 0) {
        setUnlockedAchievements(newAchievements);
      }
      setSessionComplete(true);
    }
  }, [currentIndex, words.length, nextWord, getSessionStats, checkAndUnlockAchievements]);

  const handleEndSession = async () => {
    const summary = endSession();

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
    }

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
    setQuestions([]);
    setSessionInitialized(false);
    endSession();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionComplete || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!showResult && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < (currentQuestion?.options.length || 0)) {
          handleSelectAnswer(index);
        }
        return;
      }

      if ((e.key === 'Enter' || e.key === ' ') && !showResult && selectedAnswer !== null) {
        e.preventDefault();
        handleSubmit();
        return;
      }

      if ((e.key === 'Enter' || e.key === ' ') && showResult) {
        e.preventDefault();
        handleNext();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionComplete, showResult, selectedAnswer, currentQuestion, handleSelectAnswer, handleSubmit, handleNext]);

  if (!mounted || !sessionInitialized) {
    return <LoadingSkeleton />;
  }

  if (!isActive && words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          <CardContent className="py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <Crown className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">All Common Words Mastered!</h2>
            <p className="text-muted-foreground mb-6">
              You&apos;ve learned all 100 most common NT vocabulary words. Come back later to review!
            </p>
            <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
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
              <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
              <p className="text-sm text-muted-foreground mb-4">Common NT Vocabulary</p>
              <div className="space-y-2 mb-6">
                <p className="text-lg">
                  <span className="font-bold text-primary">{sessionStats.correct}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    / {sessionStats.total} correct
                  </span>
                </p>
                <p className="text-3xl font-bold text-amber-500">{sessionStats.accuracy}%</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRestart} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Continue
                </Button>
                <Button onClick={handleEndSession} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
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
            <div className="w-10 flex items-center justify-start">
              {user && syncStatus !== 'idle' && (
                <div className="flex items-center gap-1" title={
                  syncStatus === 'syncing' ? 'Saving to cloud...' :
                  syncStatus === 'synced' ? 'Saved to cloud' :
                  'Sync failed - data saved locally'
                }>
                  {syncStatus === 'syncing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
                  {syncStatus === 'synced' && <Cloud className="w-3.5 h-3.5 text-green-500" />}
                  {syncStatus === 'error' && <CloudOff className="w-3.5 h-3.5 text-orange-500" />}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">
                {sessionProgress.current} / {sessionProgress.total}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleEndSession} aria-label="Exit session">
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Progress bar with amber theme */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
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

        {/* Question card */}
        {currentQuestion && (
          <Card className="w-full max-w-md mb-6 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center mb-4">
                What does this word mean?
              </p>
              <GreekWord
                greek={currentQuestion.word.greek}
                transliteration={currentQuestion.word.transliteration}
                size="lg"
                showAudio
                className="mb-2"
              />
              <div className="flex justify-center gap-2 mt-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  {currentQuestion.word.frequency.toLocaleString()}x in NT
                </span>
                <span className="text-xs text-muted-foreground py-1">
                  {currentQuestion.word.partOfSpeech}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answer options */}
        {currentQuestion && (
          <div
            className="w-full max-w-md space-y-3 mb-6"
            role="radiogroup"
            aria-label="Answer options"
          >
            {currentQuestion.options.map((option, index) => (
              <QuizOption
                key={index}
                label={option}
                index={index}
                selected={selectedAnswer === index}
                correct={
                  showResult
                    ? index === currentQuestion.correctIndex
                      ? true
                      : selectedAnswer === index
                      ? false
                      : null
                    : null
                }
                disabled={showResult}
                onSelect={() => handleSelectAnswer(index)}
              />
            ))}
          </div>
        )}

        {showResult && currentQuestion && (
          <div className="sr-only" role="status" aria-live="polite">
            {selectedAnswer === currentQuestion.correctIndex
              ? `Correct! The answer is ${currentQuestion.word.gloss}.`
              : `Incorrect. The correct answer is ${currentQuestion.word.gloss}.`}
          </div>
        )}

        {/* Action button */}
        <div className="w-full max-w-md">
          {!showResult ? (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              disabled={selectedAnswer === null}
              onClick={handleSubmit}
            >
              Check Answer
            </Button>
          ) : (
            <Button size="lg" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" onClick={handleNext}>
              {currentIndex < words.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                'See Results'
              )}
            </Button>
          )}
        </div>

        {/* Feedback message */}
        {showResult && currentQuestion && (
          <div
            className={cn(
              'mt-4 p-4 rounded-xl w-full max-w-md text-center',
              selectedAnswer === currentQuestion.correctIndex
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
            )}
          >
            <p className="font-bold text-lg">
              {selectedAnswer === currentQuestion.correctIndex
                ? 'Correct!'
                : 'Incorrect'}
            </p>
            {selectedAnswer !== currentQuestion.correctIndex && (
              <p className="text-sm mt-1">
                The correct answer is: <strong>{currentQuestion.word.gloss}</strong>
              </p>
            )}
            <p className="text-xs mt-2 opacity-80">
              {currentQuestion.word.definition}
            </p>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
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
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">1-4</kbd> Select option</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">Enter</kbd> Submit/Next</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-background border text-[10px]">Space</kbd> Submit/Next</span>
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
              <div className="font-bold text-amber-500">{sessionStats.accuracy}%</div>
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
        <div className="w-full max-w-md space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
