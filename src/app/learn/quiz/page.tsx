'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, RotateCcw, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import { GreekWord } from '@/components/GreekWord';
import { QuizOption } from '@/components/QuizOption';
import { XPBar, XPGain } from '@/components/XPBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, shuffle, getRandomItems } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord, QuizQuestion } from '@/types';

const MAX_SESSION_CARDS = 20;

function generateQuizQuestion(
  word: VocabularyWord,
  allWords: VocabularyWord[]
): QuizQuestion {
  // Get distractors from same tier or adjacent tiers
  const sameOrAdjacentTier = allWords.filter(
    (w) =>
      w.id !== word.id &&
      Math.abs(w.tier - word.tier) <= 1 &&
      w.gloss !== word.gloss
  );

  // Pick 3 random distractors
  const distractors = getRandomItems(sameOrAdjacentTier, 3).map((w) => w.gloss);

  // Create options array with correct answer and distractors
  const options = shuffle([word.gloss, ...distractors]);
  const correctIndex = options.indexOf(word.gloss);

  return {
    word,
    options,
    correctIndex,
  };
}

export default function QuizPage() {
  const router = useRouter();
  const { stats, progress, reviewWord, initializeWord, getDueWords } = useUserStore();
  const {
    isActive,
    startSession,
    endSession,
    words,
    currentIndex,
    showResult,
    selectedAnswer,
    selectAnswer,
    submitQuizAnswer,
    nextWord,
    getProgress,
    getSessionStats,
  } = useSessionStore();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
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
        // Learn new words
        const knownWordIds = Object.keys(progress);
        const newWords = vocabularyData.words.filter(
          (w) => !knownWordIds.includes(w.id)
        );
        sessionWords = newWords.sort((a, b) => a.tier - b.tier) as VocabularyWord[];
      }

      // Limit and shuffle
      sessionWords = shuffle(sessionWords.slice(0, MAX_SESSION_CARDS));

      if (sessionWords.length > 0) {
        // Initialize progress for new words
        sessionWords.forEach((w) => initializeWord(w.id));

        // Generate quiz questions
        const allWords = vocabularyData.words as VocabularyWord[];
        const generatedQuestions = sessionWords.map((word) =>
          generateQuizQuestion(word, allWords)
        );
        setQuestions(generatedQuestions);

        startSession('quiz', sessionWords);
      }

      setSessionInitialized(true);
    }
  }, [mounted, isActive, getDueWords, progress, initializeWord, startSession]);

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

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    submitQuizAnswer(isCorrect);

    // Update SRS and get XP
    const quality = isCorrect ? 5 : 1;
    const { xpGained } = reviewWord(currentQuestion.word.id, quality);

    if (xpGained > 0) {
      setLastXP(xpGained);
      setShowXPGain(true);
    }
  }, [selectedAnswer, currentQuestion, submitQuizAnswer, reviewWord]);

  const handleNext = useCallback(() => {
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
    setQuestions([]);
    setSessionInitialized(false);
    endSession();
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
            <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-lg">
                <span className="font-bold text-primary">{sessionStats.correct}</span>
                <span className="text-muted-foreground">
                  {' '}
                  / {sessionStats.total} correct
                </span>
              </p>
              <p className="text-3xl font-bold text-blue-500">{sessionStats.accuracy}%</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
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
              className="h-full bg-blue-500 transition-all duration-300"
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
          <Card className="w-full max-w-md mb-6">
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
                <span
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    currentQuestion.word.tier === 1 &&
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                    currentQuestion.word.tier === 2 &&
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
                    currentQuestion.word.tier === 3 &&
                      'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                    currentQuestion.word.tier === 4 &&
                      'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                    currentQuestion.word.tier === 5 &&
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  )}
                >
                  Tier {currentQuestion.word.tier}
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
          <div className="w-full max-w-md space-y-3 mb-6">
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

        {/* Action button */}
        <div className="w-full max-w-md">
          {!showResult ? (
            <Button
              size="lg"
              className="w-full"
              disabled={selectedAnswer === null}
              onClick={handleSubmit}
            >
              Check Answer
            </Button>
          ) : (
            <Button size="lg" className="w-full" onClick={handleNext}>
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
        <div className="w-full max-w-md space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
