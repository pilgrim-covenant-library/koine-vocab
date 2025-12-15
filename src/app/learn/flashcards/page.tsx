'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, RotateCcw } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { FlashCard } from '@/components/FlashCard';
import { ReviewButtons } from '@/components/ReviewButtons';
import { XPBar, XPGain } from '@/components/XPBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { shuffle } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord } from '@/types';

const MAX_SESSION_CARDS = 20;

export default function FlashcardsPage() {
  const router = useRouter();
  const { stats, progress, reviewWord, initializeWord, getWordProgress, getDueWords } =
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
    getProgress,
    getSessionStats,
  } = useSessionStore();

  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isActive) {
      // Get words for this session
      const dueWords = getDueWords();
      let sessionWords: VocabularyWord[] = [];

      if (dueWords.length > 0) {
        // Review due words first
        const dueWordIds = dueWords.map((p) => p.wordId);
        sessionWords = vocabularyData.words.filter((w) =>
          dueWordIds.includes(w.id)
        ) as VocabularyWord[];
      } else {
        // Learn new words - get words not yet in progress
        const knownWordIds = Object.keys(progress);
        const newWords = vocabularyData.words.filter(
          (w) => !knownWordIds.includes(w.id)
        );
        // Sort by tier (learn easier words first)
        sessionWords = newWords.sort((a, b) => a.tier - b.tier) as VocabularyWord[];
      }

      // Limit and shuffle
      sessionWords = shuffle(sessionWords.slice(0, MAX_SESSION_CARDS));

      if (sessionWords.length > 0) {
        // Initialize progress for new words
        sessionWords.forEach((w) => initializeWord(w.id));
        startSession('flashcard', sessionWords);
      }

      setSessionInitialized(true);
    }
  }, [mounted, isActive, getDueWords, progress, initializeWord, startSession]);

  const currentWord = words[currentIndex] as VocabularyWord | undefined;
  const currentProgress = currentWord ? getWordProgress(currentWord.id) : null;
  const sessionProgress = getProgress();
  const sessionStats = getSessionStats();

  const handleRate = useCallback(
    (quality: number) => {
      if (!currentWord) return;

      // Review the word and get XP
      const { xpGained, leveledUp } = reviewWord(currentWord.id, quality);

      // Show XP gain animation
      if (xpGained > 0) {
        setLastXP(xpGained);
        setShowXPGain(true);
      }

      // Move to next word or end session
      if (currentIndex < words.length - 1) {
        nextWord();
      } else {
        setSessionComplete(true);
      }
    },
    [currentWord, currentIndex, words.length, reviewWord, nextWord]
  );

  const handleEndSession = () => {
    const summary = endSession();
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
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="icon" onClick={handleEndSession}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium">
              {sessionProgress.current} / {sessionProgress.total}
            </span>
            <Button variant="ghost" size="icon" onClick={handleEndSession}>
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

        {/* Flashcard */}
        {currentWord && (
          <FlashCard
            word={currentWord}
            isFlipped={isFlipped}
            onFlip={flipCard}
            className="mb-6"
          />
        )}

        {/* Review buttons (only show when flipped) */}
        {isFlipped && (
          <ReviewButtons
            onRate={handleRate}
            progress={currentProgress}
            className="w-full max-w-md"
          />
        )}

        {/* Tap hint (when not flipped) */}
        {!isFlipped && (
          <p className="text-sm text-muted-foreground text-center">
            Tap the card to see the answer
          </p>
        )}
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
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md h-72 bg-muted rounded-2xl" />
      </main>
    </div>
  );
}
