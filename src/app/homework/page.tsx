'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { cn } from '@/lib/utils';

export default function HomeworkPage() {
  const { homework1, homework2, homework3, homework4, homework5, homework6, homework7, getOverallProgress, getOverallProgress2, getOverallProgress3, getOverallProgress4, getOverallProgress5, getOverallProgress6, getOverallProgress7 } = useHomeworkStore();
  const progress = getOverallProgress();
  const progress2 = getOverallProgress2();
  const progress3 = getOverallProgress3();
  const progress4 = getOverallProgress4();
  const progress5 = getOverallProgress5();
  const progress6 = getOverallProgress6();
  const progress7 = getOverallProgress7();

  const getStatusIcon = () => {
    switch (homework1.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-primary" />;
      default:
        return <BookOpen className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (homework1.status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  const getActionButton = () => {
    switch (homework1.status) {
      case 'completed':
        return (
          <Link href="/homework/hw1/complete">
            <Button className="gap-2">
              <CheckCircle className="w-4 h-4" />
              View Results
            </Button>
          </Link>
        );
      case 'in_progress':
        return (
          <Link href="/homework/hw1">
            <Button className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Continue
            </Button>
          </Link>
        );
      default:
        return (
          <Link href="/homework/hw1">
            <Button className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Start
            </Button>
          </Link>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Page title */}
          <div>
            <h1 className="text-3xl font-bold">Homework</h1>
            <p className="text-muted-foreground mt-1">
              Complete assignments to test your Greek knowledge
            </p>
          </div>

          {/* Homework 1 Card */}
          <Card className="overflow-hidden">
            <div
              className={cn(
                'h-2',
                homework1.status === 'completed'
                  ? 'bg-green-500'
                  : homework1.status === 'in_progress'
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
              style={{
                width:
                  homework1.status === 'completed'
                    ? '100%'
                    : `${progress.percentage}%`,
              }}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <CardTitle className="text-xl">Homework 1</CardTitle>
                    <CardDescription>
                      Greek Alphabet Foundations
                    </CardDescription>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    homework1.status === 'completed' &&
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    homework1.status === 'in_progress' &&
                      'bg-primary/10 text-primary',
                    homework1.status === 'not_started' &&
                      'bg-muted text-muted-foreground'
                  )}
                >
                  {getStatusText()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For students who have just learned the Greek alphabet. This homework covers:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  Common NT Word Transliteration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  Verse Transliteration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  Grammar Terms (MCQ)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    4
                  </span>
                  Greek Cases (MCQ)
                </li>
                <li className="flex items-center gap-2 sm:col-span-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    5
                  </span>
                  Article Paradigm Parsing (MCQ)
                </li>
              </ul>

              {/* Progress indicator */}
              {homework1.status !== 'not_started' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sections completed
                    </span>
                    <span className="font-medium">
                      {progress.completed}/5
                    </span>
                  </div>
                  {homework1.status === 'completed' && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium">
                        {homework1.totalScore}/{homework1.totalPossible} (
                        {Math.round(
                          (homework1.totalScore / homework1.totalPossible) * 100
                        )}
                        %)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              <div className="pt-2">{getActionButton()}</div>
            </CardContent>
          </Card>

          {/* Homework 2 Card */}
          <Card className="overflow-hidden">
            <div
              className={cn(
                'h-2',
                homework2.status === 'completed'
                  ? 'bg-green-500'
                  : homework2.status === 'in_progress'
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
              style={{
                width:
                  homework2.status === 'completed'
                    ? '100%'
                    : `${progress2.percentage}%`,
              }}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {homework2.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : homework2.status === 'in_progress' ? (
                    <Clock className="w-6 h-6 text-primary" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-xl">Homework 2</CardTitle>
                    <CardDescription>
                      Noun Declensions, Pronouns & Prepositions
                    </CardDescription>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    homework2.status === 'completed' &&
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    homework2.status === 'in_progress' &&
                      'bg-primary/10 text-primary',
                    homework2.status === 'not_started' &&
                      'bg-muted text-muted-foreground'
                  )}
                >
                  {homework2.status === 'completed'
                    ? 'Completed'
                    : homework2.status === 'in_progress'
                    ? 'In Progress'
                    : 'Not Started'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For students learning Greek noun morphology. This homework covers:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  Masculine Noun Parsing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  Feminine Noun Parsing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  Neuter Noun Parsing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    4
                  </span>
                  Personal Pronouns
                </li>
                <li className="flex items-center gap-2 sm:col-span-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    5
                  </span>
                  Prepositions & Their Cases
                </li>
              </ul>

              {/* Progress indicator */}
              {homework2.status !== 'not_started' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sections completed
                    </span>
                    <span className="font-medium">
                      {progress2.completed}/5
                    </span>
                  </div>
                  {homework2.status === 'completed' && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium">
                        {homework2.totalScore}/{homework2.totalPossible} (
                        {Math.round(
                          (homework2.totalScore / homework2.totalPossible) * 100
                        )}
                        %)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              <div className="pt-2">
                {homework2.status === 'completed' ? (
                  <Link href="/homework/hw2/complete">
                    <Button className="gap-2">
                      <CheckCircle className="w-4 h-4" />
                      View Results
                    </Button>
                  </Link>
                ) : homework2.status === 'in_progress' ? (
                  <Link href="/homework/hw2">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Continue
                    </Button>
                  </Link>
                ) : (
                  <Link href="/homework/hw2">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Start
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Homework 3 Card */}
          <Card className="overflow-hidden">
            <div
              className={cn(
                'h-2',
                homework3.status === 'completed'
                  ? 'bg-green-500'
                  : homework3.status === 'in_progress'
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
              style={{
                width:
                  homework3.status === 'completed'
                    ? '100%'
                    : `${progress3.percentage}%`,
              }}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {homework3.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : homework3.status === 'in_progress' ? (
                    <Clock className="w-6 h-6 text-primary" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-xl">Homework 3</CardTitle>
                    <CardDescription>
                      Greek Verb Conjugations
                    </CardDescription>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    homework3.status === 'completed' &&
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    homework3.status === 'in_progress' &&
                      'bg-primary/10 text-primary',
                    homework3.status === 'not_started' &&
                      'bg-muted text-muted-foreground'
                  )}
                >
                  {homework3.status === 'completed'
                    ? 'Completed'
                    : homework3.status === 'in_progress'
                    ? 'In Progress'
                    : 'Not Started'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For students learning Greek verb morphology. This homework covers:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  Present Active Indicative (λύω)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  Imperfect Active Indicative (λύω)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  Present Active Indicative (εἰμί)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    4
                  </span>
                  Imperfect Active Indicative (εἰμί)
                </li>
                <li className="flex items-center gap-2 sm:col-span-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    5
                  </span>
                  First Aorist Active Indicative (λύω)
                </li>
              </ul>

              {/* Progress indicator */}
              {homework3.status !== 'not_started' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sections completed
                    </span>
                    <span className="font-medium">
                      {progress3.completed}/5
                    </span>
                  </div>
                  {homework3.status === 'completed' && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium">
                        {homework3.totalScore}/{homework3.totalPossible} (
                        {Math.round(
                          (homework3.totalScore / homework3.totalPossible) * 100
                        )}
                        %)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              <div className="pt-2">
                {homework3.status === 'completed' ? (
                  <Link href="/homework/hw3/complete">
                    <Button className="gap-2">
                      <CheckCircle className="w-4 h-4" />
                      View Results
                    </Button>
                  </Link>
                ) : homework3.status === 'in_progress' ? (
                  <Link href="/homework/hw3">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Continue
                    </Button>
                  </Link>
                ) : (
                  <Link href="/homework/hw3">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Start
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Homework 4 Card */}
          <Card className="overflow-hidden">
            <div
              className={cn(
                'h-2',
                homework4.status === 'completed'
                  ? 'bg-green-500'
                  : homework4.status === 'in_progress'
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
              style={{
                width:
                  homework4.status === 'completed'
                    ? '100%'
                    : `${progress4.percentage}%`,
              }}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {homework4.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : homework4.status === 'in_progress' ? (
                    <Clock className="w-6 h-6 text-primary" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-xl">Homework 4</CardTitle>
                    <CardDescription>
                      Future Tense, Participles, Pronouns & Conjunctions
                    </CardDescription>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    homework4.status === 'completed' &&
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    homework4.status === 'in_progress' &&
                      'bg-primary/10 text-primary',
                    homework4.status === 'not_started' &&
                      'bg-muted text-muted-foreground'
                  )}
                >
                  {homework4.status === 'completed'
                    ? 'Completed'
                    : homework4.status === 'in_progress'
                    ? 'In Progress'
                    : 'Not Started'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For students learning advanced Greek grammar. This homework covers:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  Future Active Indicative (λύω)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  Present Active Participles
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  1st Aorist Active Participles
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    4
                  </span>
                  Personal Pronouns (1st & 2nd)
                </li>
                <li className="flex items-center gap-2 sm:col-span-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    5
                  </span>
                  Conjunctions
                </li>
              </ul>

              {/* Progress indicator */}
              {homework4.status !== 'not_started' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sections completed
                    </span>
                    <span className="font-medium">
                      {progress4.completed}/5
                    </span>
                  </div>
                  {homework4.status === 'completed' && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium">
                        {homework4.totalScore}/{homework4.totalPossible} (
                        {Math.round(
                          (homework4.totalScore / homework4.totalPossible) * 100
                        )}
                        %)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              <div className="pt-2">
                {homework4.status === 'completed' ? (
                  <Link href="/homework/hw4/complete">
                    <Button className="gap-2">
                      <CheckCircle className="w-4 h-4" />
                      View Results
                    </Button>
                  </Link>
                ) : homework4.status === 'in_progress' ? (
                  <Link href="/homework/hw4">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Continue
                    </Button>
                  </Link>
                ) : (
                  <Link href="/homework/hw4">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Start
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Homework 5 Card */}
          <Card className="overflow-hidden">
            <div
              className={cn(
                'h-2',
                homework5.status === 'completed'
                  ? 'bg-green-500'
                  : homework5.status === 'in_progress'
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
              style={{
                width:
                  homework5.status === 'completed'
                    ? '100%'
                    : `${progress5.percentage}%`,
              }}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {homework5.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : homework5.status === 'in_progress' ? (
                    <Clock className="w-6 h-6 text-primary" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-xl">Homework 5</CardTitle>
                    <CardDescription>
                      Imperative Mood, Passive & Middle Voice, ἔρχομαι & Future Tense
                    </CardDescription>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    homework5.status === 'completed' &&
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    homework5.status === 'in_progress' &&
                      'bg-primary/10 text-primary',
                    homework5.status === 'not_started' &&
                      'bg-muted text-muted-foreground'
                  )}
                >
                  {homework5.status === 'completed'
                    ? 'Completed'
                    : homework5.status === 'in_progress'
                    ? 'In Progress'
                    : 'Not Started'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For students learning Greek voice and mood distinctions. This homework covers:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  Imperative Mood (λύω)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  Passive Voice (λύω)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  Middle Voice (λύω)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    4
                  </span>
                  ἔρχομαι
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    5
                  </span>
                  Future Tense (λύω + εἰμί)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    6
                  </span>
                  Verse Practice
                </li>
              </ul>

              {/* Progress indicator */}
              {homework5.status !== 'not_started' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sections completed
                    </span>
                    <span className="font-medium">
                      {progress5.completed}/6
                    </span>
                  </div>
                  {homework5.status === 'completed' && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium">
                        {homework5.totalScore}/{homework5.totalPossible} (
                        {Math.round(
                          (homework5.totalScore / homework5.totalPossible) * 100
                        )}
                        %)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              <div className="pt-2">
                {homework5.status === 'completed' ? (
                  <Link href="/homework/hw5/complete">
                    <Button className="gap-2">
                      <CheckCircle className="w-4 h-4" />
                      View Results
                    </Button>
                  </Link>
                ) : homework5.status === 'in_progress' ? (
                  <Link href="/homework/hw5">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Continue
                    </Button>
                  </Link>
                ) : (
                  <Link href="/homework/hw5">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Start
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Homework 6 Card */}
          <Card className="overflow-hidden">
            <div
              className={cn(
                'h-2',
                homework6.status === 'completed'
                  ? 'bg-green-500'
                  : homework6.status === 'in_progress'
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
              style={{
                width:
                  homework6.status === 'completed'
                    ? '100%'
                    : `${progress6.percentage}%`,
              }}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {homework6.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : homework6.status === 'in_progress' ? (
                    <Clock className="w-6 h-6 text-primary" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-xl">Homework 6</CardTitle>
                    <CardDescription>
                      Participles & Pronouns
                    </CardDescription>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    homework6.status === 'completed' &&
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    homework6.status === 'in_progress' &&
                      'bg-primary/10 text-primary',
                    homework6.status === 'not_started' &&
                      'bg-muted text-muted-foreground'
                  )}
                >
                  {homework6.status === 'completed'
                    ? 'Completed'
                    : homework6.status === 'in_progress'
                    ? 'In Progress'
                    : 'Not Started'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For students learning participle gender forms and pronoun paradigms. This homework covers:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  Present Active Participles (Fem & Neut)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  εἰμί Participles (ὤν/οὖσα/ὄν)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  Aorist Active Participles (Fem & Neut)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    4
                  </span>
                  Demonstrative Pronouns
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    5
                  </span>
                  Reflexive & Relative Pronouns
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    6
                  </span>
                  Verse Practice
                </li>
              </ul>

              {/* Progress indicator */}
              {homework6.status !== 'not_started' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sections completed
                    </span>
                    <span className="font-medium">
                      {progress6.completed}/6
                    </span>
                  </div>
                  {homework6.status === 'completed' && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium">
                        {homework6.totalScore}/{homework6.totalPossible} (
                        {Math.round(
                          (homework6.totalScore / homework6.totalPossible) * 100
                        )}
                        %)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              <div className="pt-2">
                {homework6.status === 'completed' ? (
                  <Link href="/homework/hw6/complete">
                    <Button className="gap-2">
                      <CheckCircle className="w-4 h-4" />
                      View Results
                    </Button>
                  </Link>
                ) : homework6.status === 'in_progress' ? (
                  <Link href="/homework/hw6">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Continue
                    </Button>
                  </Link>
                ) : (
                  <Link href="/homework/hw6">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Start
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Homework 7 Card */}
          <Card className="overflow-hidden">
            <div
              className={cn(
                'h-2',
                homework7.status === 'completed'
                  ? 'bg-green-500'
                  : homework7.status === 'in_progress'
                  ? 'bg-primary'
                  : 'bg-muted'
              )}
              style={{
                width:
                  homework7.status === 'completed'
                    ? '100%'
                    : `${progress7.percentage}%`,
              }}
            />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {homework7.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : homework7.status === 'in_progress' ? (
                    <Clock className="w-6 h-6 text-primary" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-xl">Homework 7</CardTitle>
                    <CardDescription>
                      Perfect Tense & Subjunctive
                    </CardDescription>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium',
                    homework7.status === 'completed' &&
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    homework7.status === 'in_progress' &&
                      'bg-primary/10 text-primary',
                    homework7.status === 'not_started' &&
                      'bg-muted text-muted-foreground'
                  )}
                >
                  {homework7.status === 'completed'
                    ? 'Completed'
                    : homework7.status === 'in_progress'
                    ? 'In Progress'
                    : 'Not Started'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For students learning the perfect tense system and subjunctive mood. This homework covers:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    1
                  </span>
                  Middle/Passive Participles
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    2
                  </span>
                  Perfect Tense Indicative
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                  Perfect Participles
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    4
                  </span>
                  Pluperfect Tense
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    5
                  </span>
                  Subjunctive Mood
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    6
                  </span>
                  Verse Practice
                </li>
              </ul>

              {/* Progress indicator */}
              {homework7.status !== 'not_started' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sections completed
                    </span>
                    <span className="font-medium">
                      {progress7.completed}/6
                    </span>
                  </div>
                  {homework7.status === 'completed' && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Score</span>
                      <span className="font-medium">
                        {homework7.totalScore}/{homework7.totalPossible} (
                        {Math.round(
                          (homework7.totalScore / homework7.totalPossible) * 100
                        )}
                        %)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              <div className="pt-2">
                {homework7.status === 'completed' ? (
                  <Link href="/homework/hw7/complete">
                    <Button className="gap-2">
                      <CheckCircle className="w-4 h-4" />
                      View Results
                    </Button>
                  </Link>
                ) : homework7.status === 'in_progress' ? (
                  <Link href="/homework/hw7">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Continue
                    </Button>
                  </Link>
                ) : (
                  <Link href="/homework/hw7">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Start
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
