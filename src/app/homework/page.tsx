'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, Clock, Lock, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { cn } from '@/lib/utils';

export default function HomeworkPage() {
  const { homework1, getOverallProgress } = useHomeworkStore();
  const progress = getOverallProgress();

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

          {/* Future homeworks placeholder */}
          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-muted-foreground" />
                <div>
                  <CardTitle className="text-xl text-muted-foreground">
                    Homework 2
                  </CardTitle>
                  <CardDescription>Coming Soon</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                More homework assignments will be added as you progress in your
                Greek studies.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
