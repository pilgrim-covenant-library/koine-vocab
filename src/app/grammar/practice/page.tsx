'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, ThumbsUp, Zap, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { GreekWord } from '@/components/GreekWord';
import { cn, shuffle } from '@/lib/utils';
import {
  CASE_LABELS,
  TENSE_LABELS,
  VOICE_LABELS,
  MOOD_LABELS,
  getCaseDescription,
  getTenseDescription,
  getVoiceDescription,
  getMoodDescription,
  type GrammaticalCase,
  type Tense,
  type Voice,
  type Mood,
} from '@/lib/morphology';

type QuestionType = 'case' | 'tense' | 'voice' | 'mood';

interface PracticeQuestion {
  word: string;
  lexicalForm: string;
  gloss: string;
  questionType: QuestionType;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

// Sample questions for practice
const CASE_QUESTIONS: Omit<PracticeQuestion, 'options'>[] = [
  { word: 'λόγου', lexicalForm: 'λόγος', gloss: 'word', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  { word: 'ἀδελφῷ', lexicalForm: 'ἀδελφός', gloss: 'brother', questionType: 'case', correctAnswer: 'Dative', explanation: getCaseDescription('dative') },
  { word: 'θεόν', lexicalForm: 'θεός', gloss: 'God', questionType: 'case', correctAnswer: 'Accusative', explanation: getCaseDescription('accusative') },
  { word: 'κύριος', lexicalForm: 'κύριος', gloss: 'Lord', questionType: 'case', correctAnswer: 'Nominative', explanation: getCaseDescription('nominative') },
  { word: 'ἀγάπην', lexicalForm: 'ἀγάπη', gloss: 'love', questionType: 'case', correctAnswer: 'Accusative', explanation: getCaseDescription('accusative') },
  { word: 'πνεύματος', lexicalForm: 'πνεῦμα', gloss: 'spirit', questionType: 'case', correctAnswer: 'Genitive', explanation: getCaseDescription('genitive') },
  { word: 'ἀνθρώπῳ', lexicalForm: 'ἄνθρωπος', gloss: 'man', questionType: 'case', correctAnswer: 'Dative', explanation: getCaseDescription('dative') },
  { word: 'υἱοί', lexicalForm: 'υἱός', gloss: 'son', questionType: 'case', correctAnswer: 'Nominative', explanation: getCaseDescription('nominative') },
];

const TENSE_QUESTIONS: Omit<PracticeQuestion, 'options'>[] = [
  { word: 'λύω', lexicalForm: 'λύω', gloss: 'I loose', questionType: 'tense', correctAnswer: 'Present', explanation: getTenseDescription('present') },
  { word: 'ἔλυσα', lexicalForm: 'λύω', gloss: 'I loosed', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'λέλυκα', lexicalForm: 'λύω', gloss: 'I have loosed', questionType: 'tense', correctAnswer: 'Perfect', explanation: getTenseDescription('perfect') },
  { word: 'ἔλυον', lexicalForm: 'λύω', gloss: 'I was loosing', questionType: 'tense', correctAnswer: 'Imperfect', explanation: getTenseDescription('imperfect') },
  { word: 'λύσω', lexicalForm: 'λύω', gloss: 'I will loose', questionType: 'tense', correctAnswer: 'Future', explanation: getTenseDescription('future') },
  { word: 'ἐπίστευσα', lexicalForm: 'πιστεύω', gloss: 'I believed', questionType: 'tense', correctAnswer: 'Aorist', explanation: getTenseDescription('aorist') },
  { word: 'πιστεύω', lexicalForm: 'πιστεύω', gloss: 'I believe', questionType: 'tense', correctAnswer: 'Present', explanation: getTenseDescription('present') },
  { word: 'ἐλελύκειν', lexicalForm: 'λύω', gloss: 'I had loosed', questionType: 'tense', correctAnswer: 'Pluperfect', explanation: getTenseDescription('pluperfect') },
];

const VOICE_QUESTIONS: Omit<PracticeQuestion, 'options'>[] = [
  { word: 'λύω', lexicalForm: 'λύω', gloss: 'I loose', questionType: 'voice', correctAnswer: 'Active', explanation: getVoiceDescription('active') },
  { word: 'λύομαι', lexicalForm: 'λύω', gloss: 'I am loosed', questionType: 'voice', correctAnswer: 'Middle/Passive', explanation: getVoiceDescription('middle/passive') },
  { word: 'ἐλύθην', lexicalForm: 'λύω', gloss: 'I was loosed', questionType: 'voice', correctAnswer: 'Passive', explanation: getVoiceDescription('passive') },
  { word: 'ἐλυσάμην', lexicalForm: 'λύω', gloss: 'I loosed for myself', questionType: 'voice', correctAnswer: 'Middle', explanation: getVoiceDescription('middle') },
  { word: 'γράφω', lexicalForm: 'γράφω', gloss: 'I write', questionType: 'voice', correctAnswer: 'Active', explanation: getVoiceDescription('active') },
  { word: 'γράφομαι', lexicalForm: 'γράφω', gloss: 'I am written', questionType: 'voice', correctAnswer: 'Middle/Passive', explanation: getVoiceDescription('middle/passive') },
];

const MOOD_QUESTIONS: Omit<PracticeQuestion, 'options'>[] = [
  { word: 'λύω', lexicalForm: 'λύω', gloss: 'I loose', questionType: 'mood', correctAnswer: 'Indicative', explanation: getMoodDescription('indicative') },
  { word: 'λύσωμεν', lexicalForm: 'λύω', gloss: 'let us loose', questionType: 'mood', correctAnswer: 'Subjunctive', explanation: getMoodDescription('subjunctive') },
  { word: 'λῦε', lexicalForm: 'λύω', gloss: 'loose!', questionType: 'mood', correctAnswer: 'Imperative', explanation: getMoodDescription('imperative') },
  { word: 'λύσαι', lexicalForm: 'λύω', gloss: 'to loose', questionType: 'mood', correctAnswer: 'Infinitive', explanation: getMoodDescription('infinitive') },
  { word: 'πιστεύωμεν', lexicalForm: 'πιστεύω', gloss: 'let us believe', questionType: 'mood', correctAnswer: 'Subjunctive', explanation: getMoodDescription('subjunctive') },
  { word: 'πίστευε', lexicalForm: 'πιστεύω', gloss: 'believe!', questionType: 'mood', correctAnswer: 'Imperative', explanation: getMoodDescription('imperative') },
];

// Fisher-Yates shuffle for unbiased randomization
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateOptions(correctAnswer: string, allOptions: string[]): string[] {
  const options = new Set<string>([correctAnswer]);
  const shuffled = shuffleArray(allOptions);

  for (const option of shuffled) {
    if (options.size >= 4) break;
    options.add(option);
  }

  return shuffleArray([...options]);
}

function generateQuestions(type: QuestionType | 'all', count: number = 10): PracticeQuestion[] {
  let pool: Omit<PracticeQuestion, 'options'>[] = [];
  let allOptions: string[] = [];

  if (type === 'case' || type === 'all') {
    pool = [...pool, ...CASE_QUESTIONS];
  }
  if (type === 'tense' || type === 'all') {
    pool = [...pool, ...TENSE_QUESTIONS];
  }
  if (type === 'voice' || type === 'all') {
    pool = [...pool, ...VOICE_QUESTIONS];
  }
  if (type === 'mood' || type === 'all') {
    pool = [...pool, ...MOOD_QUESTIONS];
  }

  const shuffled = shuffle([...pool]).slice(0, count);

  return shuffled.map((q) => {
    let opts: string[] = [];
    switch (q.questionType) {
      case 'case':
        opts = Object.values(CASE_LABELS);
        break;
      case 'tense':
        opts = Object.values(TENSE_LABELS);
        break;
      case 'voice':
        opts = ['Active', 'Middle', 'Passive', 'Middle/Passive'];
        break;
      case 'mood':
        opts = Object.values(MOOD_LABELS);
        break;
    }
    return {
      ...q,
      options: generateOptions(q.correctAnswer, opts),
    };
  });
}

export default function PracticePage() {
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [practiceType, setPracticeType] = useState<QuestionType | 'all'>('all');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startPractice = () => {
    const newQuestions = generateQuestions(practiceType, 10);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setStats({ correct: 0, incorrect: 0 });
    setSessionComplete(false);
    setStarted(true);
  };

  const handleSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setShowResult(true);

    const isCorrect = selectedAnswer === questions[currentIndex].correctAnswer;
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
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setSessionComplete(false);
  };

  const currentQuestion = questions[currentIndex];
  const accuracy = stats.correct + stats.incorrect > 0
    ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100)
    : 0;

  if (!mounted) {
    return null;
  }

  // Setup screen
  if (!started) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/grammar">
              <Button variant="ghost" size="icon" aria-label="Back to grammar">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Practice Parsing</h1>
              <p className="text-xs text-muted-foreground">Test your morphology skills</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2">Morphology Practice</h2>
            <p className="text-muted-foreground text-sm">
              Identify cases, tenses, voices, and moods in Greek words.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="py-4">
              <h3 className="font-medium mb-3">Practice Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'case', label: 'Cases' },
                  { id: 'tense', label: 'Tenses' },
                  { id: 'voice', label: 'Voices' },
                  { id: 'mood', label: 'Moods' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPracticeType(type.id as QuestionType | 'all')}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all',
                      practiceType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    )}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full h-14" onClick={startPractice}>
            Start Practice
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </main>
      </div>
    );
  }

  // Session complete
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
            <h2 className="text-2xl font-bold mb-2">Practice Complete!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-lg">
                <span className="font-bold text-emerald-500">{stats.correct}</span>
                <span className="text-muted-foreground"> correct / </span>
                <span className="font-bold text-red-500">{stats.incorrect}</span>
                <span className="text-muted-foreground"> incorrect</span>
              </p>
              <p className="text-3xl font-bold text-primary">{accuracy}%</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/grammar" className="flex-1">
                <Button className="w-full">Done</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active practice
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-500 font-medium">✓ {stats.correct}</span>
              <span className="text-red-500 font-medium">✗ {stats.incorrect}</span>
            </div>
            <span className="text-sm font-medium">
              {currentIndex + 1} / {questions.length}
            </span>
            <Link href="/grammar">
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
            {/* Question card */}
            <Card className="w-full max-w-md mb-6">
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  What is the{' '}
                  <span className="font-medium text-foreground">
                    {currentQuestion.questionType}
                  </span>{' '}
                  of this form?
                </p>
                <GreekWord greek={currentQuestion.word} size="xl" className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  from <GreekWord greek={currentQuestion.lexicalForm} size="sm" className="inline" /> ({currentQuestion.gloss})
                </p>
              </CardContent>
            </Card>

            {/* Options */}
            <div className="w-full max-w-md space-y-2 mb-6">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;

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
                    key={option}
                    onClick={() => handleSelect(option)}
                    disabled={showResult}
                    className={cn(
                      'w-full p-4 rounded-xl border text-left transition-all',
                      isSelected && !showResult && 'border-primary bg-primary/5',
                      showResult && bgColor,
                      !showResult && !isSelected && 'hover:border-muted-foreground/50',
                      showResult && 'cursor-default'
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {showResult && (
              <div
                className={cn(
                  'w-full max-w-md p-4 rounded-xl mb-4',
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                )}
              >
                <p className="font-bold">
                  {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                </p>
                {selectedAnswer !== currentQuestion.correctAnswer && (
                  <p className="text-sm mt-1">
                    The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
                  </p>
                )}
                <p className="text-xs mt-2 flex items-start gap-1 opacity-80">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Action button */}
            <div className="w-full max-w-md">
              {!showResult ? (
                <Button
                  size="lg"
                  className="w-full"
                  disabled={!selectedAnswer}
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
