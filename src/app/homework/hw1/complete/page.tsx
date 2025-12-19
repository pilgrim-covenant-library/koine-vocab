'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, CheckCircle, RotateCcw, Home, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { SECTION_META, type SectionId } from '@/types/homework';
import { cn } from '@/lib/utils';

export default function CompletePage() {
  const router = useRouter();
  const { homework1, completeHomework, resetHomework, getOverallProgress } = useHomeworkStore();

  const progress = getOverallProgress();
  const sections: SectionId[] = [1, 2, 3, 4, 5];

  // Complete homework if not already
  useEffect(() => {
    if (homework1.status !== 'completed' && progress.completed === 5) {
      completeHomework();
    }
  }, [homework1.status, progress.completed, completeHomework]);

  // Calculate grade
  const percentage = Math.round((homework1.totalScore / homework1.totalPossible) * 100);
  const getGrade = () => {
    if (percentage >= 90) return { letter: 'A', color: 'text-green-500' };
    if (percentage >= 80) return { letter: 'B', color: 'text-blue-500' };
    if (percentage >= 70) return { letter: 'C', color: 'text-yellow-500' };
    if (percentage >= 60) return { letter: 'D', color: 'text-orange-500' };
    return { letter: 'F', color: 'text-red-500' };
  };
  const grade = getGrade();

  const handleRetry = () => {
    resetHomework();
    router.push('/homework/hw1');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-8">
          {/* Celebration header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30">
              <Trophy className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold">Homework Complete!</h1>
            <p className="text-muted-foreground">
              Great job completing Homework 1: Greek Alphabet Foundations
            </p>
          </div>

          {/* Score card */}
          <Card className="overflow-hidden">
            <div className="h-2 bg-green-500" />
            <CardContent className="pt-8 pb-6 text-center">
              <div className="space-y-4">
                {/* Grade */}
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    Your Grade
                  </p>
                  <p className={cn('text-7xl font-bold', grade.color)}>
                    {grade.letter}
                  </p>
                </div>

                {/* Score */}
                <div className="flex items-center justify-center gap-8 py-4 border-y">
                  <div>
                    <p className="text-3xl font-bold">{homework1.totalScore}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-3xl text-muted-foreground">/</div>
                  <div>
                    <p className="text-3xl font-bold">{homework1.totalPossible}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div className="text-3xl text-muted-foreground">=</div>
                  <div>
                    <p className="text-3xl font-bold text-primary">{percentage}%</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Section Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sections.map((sectionId) => {
                  const section = homework1.sections[sectionId];
                  const meta = SECTION_META[sectionId];
                  const sectionPercentage = Math.round(
                    (section.score / section.totalQuestions) * 100
                  );

                  return (
                    <div key={sectionId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{meta.title}</span>
                        </div>
                        <span className="text-sm">
                          {section.score}/{section.totalQuestions} ({sectionPercentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            sectionPercentage >= 80
                              ? 'bg-green-500'
                              : sectionPercentage >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          )}
                          style={{ width: `${sectionPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Feedback based on score */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                {percentage >= 90 && (
                  <>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      Excellent work!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have demonstrated a strong understanding of Greek alphabet
                      foundations. You're ready to move on to more advanced topics!
                    </p>
                  </>
                )}
                {percentage >= 70 && percentage < 90 && (
                  <>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      Good progress!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You're building a solid foundation. Consider reviewing the help
                      pages for any sections where you scored below 80%.
                    </p>
                  </>
                )}
                {percentage < 70 && (
                  <>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      Keep practicing!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The Greek alphabet takes time to master. Review the help pages
                      and try again when you're ready. Practice makes perfect!
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="outline" onClick={handleRetry} className="gap-2 w-full sm:w-auto">
              <RotateCcw className="w-4 h-4" />
              Retry Homework
            </Button>
            <Link href="/homework" className="w-full sm:w-auto">
              <Button className="gap-2 w-full">
                Back to Homework
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Quick links */}
          <div className="text-center pt-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
