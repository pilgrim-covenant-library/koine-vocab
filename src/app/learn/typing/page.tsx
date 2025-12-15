'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, RotateCcw, ChevronRight, Eye } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { GreekWord } from '@/components/GreekWord';
import { TypingInput, TypingFeedback } from '@/components/TypingInput';
import { XPBar, XPGain } from '@/components/XPBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, shuffle, checkTypingAnswer } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord } from '@/types';

const MAX_SESSION_CARDS = 20;

type AnswerStatus = 'idle' | 'correct' | 'incorrect' | 'close';

export default function TypingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { stats, progress, reviewWord, initializeWord, getDueWords } = useUserStore();
  const {
    isActive,
    startSession,
    endSession,
    words,
    currentIndex,
    showResult,
    typedAnswer,
    setTypedAnswer,
    submitTypedAnswer,
    nextWord,
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
        const dueWordIds = dueWords.map((p) => p.wordId);
        sessionWords = vocabularyData.words.filter((w) =>
          dueWordIds.includes(w.id)
        ) as VocabularyWord[];
      } else {
        const knownWordIds = Object.keys(progress);
        const newWords = vocabularyData.words.filter(
          (w) => !knownWordIds.includes(w.id)
        );
        sessionWords = newWords.sort((a, b) => a.tier - b.tier) as VocabularyWord[];
      }

      sessionWords = shuffle(sessionWords.slice(0, MAX_SESSION_CARDS));

      if (sessionWords.length > 0) {
        sessionWords.forEach((w) => initializeWord(w.id));
        startSession('typing', sessionWords);
      }

      setSessionInitialized(true);
    }
  }, [mounted, isActive, getDueWords, progress, initializeWord, startSession]);

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
    // exact = 5, correct = 5, close = 4, incorrect = 1
    const quality = result === 'exact' ? 5 : result === 'correct' ? 5 : result === 'close' ? 4 : 1;
    const { xpGained } = reviewWord(currentWord.id, quality);

    if (xpGained > 0) {
      setLastXP(xpGained);
      setShowXPGain(true);
    }
  }, [currentWord, showResult, typedAnswer, submitTypedAnswer, reviewWord]);

  const handleNext = useCallback(() => {
    setAnswerStatus('idle');
    setShowHint(false);

    if (currentIndex < words.length - 1) {
      nextWord();
    } else {
      setSessionComplete(true);
    }
  }, [currentIndex, words.length, nextWord]);

  const handleEndSession = () => {
    endSession();
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

        {/* Hint button */}
        {!showResult && currentWord && (
          <div className="w-full max-w-md mb-4">
            {showHint ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                First letter: <strong>{currentWord.gloss[0].toUpperCase()}</strong>
                {currentWord.gloss.length > 3 && (
                  <>, Length: <strong>{currentWord.gloss.length}</strong> characters</>
                )}
              </p>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowHint}
                className="w-full text-muted-foreground"
              >
                <Eye className="w-4 h-4 mr-2" />
                Show Hint
              </Button>
            )}
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
