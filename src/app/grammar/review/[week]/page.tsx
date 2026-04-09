'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, ThumbsUp, Zap, ChevronRight, Info, BookOpen, Dumbbell, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { GreekWord } from '@/components/GreekWord';
import { cn, shuffle } from '@/lib/utils';
import { REVIEW_WEEKS, type ReviewQuestion } from '@/data/reviewWeeks';

type ReviewMode = 'practice' | 'homework';

function saveScore(week: number, mode: ReviewMode, score: number, total: number) {
  try {
    localStorage.setItem(
      `review-week-${week}-${mode}`,
      JSON.stringify({ completed: true, score, total, date: new Date().toISOString() }),
    );
  } catch { /* localStorage may be unavailable */ }
}

const modeLabels: Record<ReviewMode, { title: string; icon: typeof Dumbbell; color: string }> = {
  practice: { title: 'In-Class Practice', icon: Dumbbell, color: 'text-blue-500' },
  homework: { title: 'Homework', icon: ClipboardList, color: 'text-amber-500' },
};

export default function ReviewWeekPracticePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const weekNum = Number(params.week);
  const mode: ReviewMode = (searchParams.get('mode') === 'homework' ? 'homework' : 'practice');
  const weekData = REVIEW_WEEKS.find((w) => w.week === weekNum);

  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const questionPool = weekData ? (mode === 'homework' ? weekData.homework : weekData.inClass) : [];

  const topicGroups = useMemo(() => {
    const groups = new Map<string, number>();
    for (const q of questionPool) {
      groups.set(q.topic, (groups.get(q.topic) ?? 0) + 1);
    }
    return Array.from(groups.entries()).map(([topic, count]) => ({ topic, count }));
  }, [questionPool]);

  const startPractice = () => {
    if (!questionPool.length) return;
    setQuestions(shuffle([...questionPool]));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setStats({ correct: 0, incorrect: 0 });
    setSessionComplete(false);
    setStarted(true);
  };

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    const isCorrect = selectedAnswer === questions[currentIndex].correctIndex;
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      saveScore(weekNum, mode, stats.correct, questions.length);
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setSessionComplete(false);
  };

  if (!mounted) return null;

  const ModeIcon = modeLabels[mode].icon;

  if (!weekData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-bold mb-2">Week Not Found</h2>
            <p className="text-muted-foreground mb-4">Review week {weekNum} does not exist.</p>
            <Link href="/grammar/review">
              <Button>Back to Review Weeks</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const accuracy =
    stats.correct + stats.incorrect > 0
      ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
      : 0;

  // ---------- Session Complete ----------
  if (sessionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center">
            <div className="flex justify-center mb-4">
              {accuracy >= 80 ? (
                <Trophy className="w-16 h-16 text-amber-500" />
              ) : accuracy >= 60 ? (
                <ThumbsUp className="w-16 h-16 text-blue-500" />
              ) : (
                <Zap className="w-16 h-16 text-purple-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-1">Week {weekNum} Complete!</h2>
            <p className="text-sm text-muted-foreground mb-1">{weekData.title}</p>
            <p className="text-xs text-muted-foreground mb-4 flex items-center justify-center gap-1">
              <ModeIcon className={cn('w-3.5 h-3.5', modeLabels[mode].color)} />
              {modeLabels[mode].title}
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-lg">
                <span className="font-bold text-emerald-500">{stats.correct}</span>
                <span className="text-muted-foreground"> correct / </span>
                <span className="font-bold text-red-500">{stats.incorrect}</span>
                <span className="text-muted-foreground"> incorrect</span>
              </p>
              <p className="text-3xl font-bold text-primary">{accuracy}%</p>
              {accuracy < 80 && (
                <p className="text-sm text-muted-foreground">
                  Aim for 80%+ mastery. Review the topics and try again!
                </p>
              )}
              {accuracy >= 80 && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Great mastery! {mode === 'practice' ? 'Now try the homework.' : 'You\'re ready for the next week.'}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              {mode === 'practice' ? (
                <Link href={`/grammar/review/${weekNum}?mode=homework`} className="flex-1">
                  <Button className="w-full">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Homework
                  </Button>
                </Link>
              ) : (
                <Link href="/grammar/review" className="flex-1">
                  <Button className="w-full">All Weeks</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- Start Screen ----------
  if (!started) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/grammar/review">
              <Button variant="ghost" size="icon" aria-label="Back to review weeks">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Week {weekNum}: {weekData.title}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ModeIcon className={cn('w-3 h-3', modeLabels[mode].color)} />
                {modeLabels[mode].title} &middot; {weekData.subtitle}
              </p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-4">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{weekNum}</span>
            </div>
            <h2 className="text-xl font-bold mb-1">{weekData.title}</h2>
            <p className={cn('text-sm font-medium mb-2 flex items-center justify-center gap-1', modeLabels[mode].color)}>
              <ModeIcon className="w-4 h-4" />
              {modeLabels[mode].title}
            </p>
            <p className="text-muted-foreground text-sm">
              {mode === 'practice'
                ? 'Guided review with detailed explanations for each question. Work through these in class.'
                : 'Independent drilling — parsing, form recognition, and applied grammar. Complete on your own.'}
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="py-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Topics ({questionPool.length} questions)
              </h3>
              <div className="space-y-2">
                {topicGroups.map(({ topic, count }) => (
                  <div key={topic} className="flex items-center justify-between text-sm">
                    <span>{topic}</span>
                    <span className="text-muted-foreground">{count} {count === 1 ? 'question' : 'questions'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full h-14" onClick={startPractice}>
            Start {modeLabels[mode].title}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </main>
      </div>
    );
  }

  // ---------- Quiz In Progress ----------
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-500 font-medium">{stats.correct} correct</span>
              <span className="text-red-500 font-medium">{stats.incorrect} wrong</span>
            </div>
            <span className="text-sm font-medium">
              {currentIndex + 1} / {questions.length}
            </span>
            <Link href="/grammar/review">
              <Button variant="ghost" size="sm">Exit</Button>
            </Link>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start p-4">
        {currentQuestion && (
          <>
            <Card className="w-full max-w-md mb-4">
              <CardContent className="py-5 text-center">
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground mb-3">
                  {currentQuestion.topic}
                </span>
                <p className="text-base font-medium mb-3">{currentQuestion.question}</p>
                {currentQuestion.greek && (
                  <GreekWord greek={currentQuestion.greek} size="xl" />
                )}
              </CardContent>
            </Card>

            <div className="w-full max-w-md space-y-2 mb-6">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let bgColor = '';
                if (showResult) {
                  if (isCorrect) {
                    bgColor = 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    bgColor = 'bg-red-100 dark:bg-red-900/30 border-red-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={showResult}
                    className={cn(
                      'w-full p-4 rounded-xl border text-left transition-all',
                      isSelected && !showResult && 'border-primary bg-primary/5',
                      showResult && bgColor,
                      !showResult && !isSelected && 'hover:border-muted-foreground/50',
                      showResult && 'cursor-default',
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div
                className={cn(
                  'w-full max-w-md p-4 rounded-xl mb-4',
                  selectedAnswer === currentQuestion.correctIndex
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
                )}
              >
                <p className="font-bold">
                  {selectedAnswer === currentQuestion.correctIndex ? 'Correct!' : 'Incorrect'}
                </p>
                {selectedAnswer !== currentQuestion.correctIndex && (
                  <p className="text-sm mt-1">
                    The correct answer is: <strong>{currentQuestion.options[currentQuestion.correctIndex]}</strong>
                  </p>
                )}
                <p className="text-xs mt-2 flex items-start gap-1 opacity-80">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

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
                  {currentIndex < questions.length - 1 ? (
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
          </>
        )}
      </main>
    </div>
  );
}
