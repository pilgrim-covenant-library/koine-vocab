'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, CheckCircle, RotateCcw, Home, ArrowRight, Loader2, CloudCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { useAuthStore } from '@/stores/authStore';
import { HW8_SECTION_META, type HW8SectionId } from '@/types/homework';
import { cn } from '@/lib/utils';

export default function HW8CompletePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    homework8,
    completeHomework8,
    resetHomework8,
    resetSection8,
    getOverallProgress8,
    syncToCloud8,
    submitResult8,
    isSyncing,
  } = useHomeworkStore();

  const [hasSynced, setHasSynced] = useState(false);
  const progress = getOverallProgress8();
  const sections: HW8SectionId[] = [1, 2, 3, 4, 5, 6];

  // Complete homework and sync to cloud
  useEffect(() => {
    const finalize = async () => {
      if (homework8.status !== 'completed' && progress.completed === 6) {
        completeHomework8();
      }

      // Final sync to cloud and submit result for teacher dashboard
      if (user && !hasSynced) {
        await syncToCloud8(user.uid);
        // Submit to teacher dashboard
        await submitResult8(user.uid, {
          displayName: user.displayName,
          email: user.email,
        });
        setHasSynced(true);
      }
    };

    finalize();
  }, [homework8.status, progress.completed, completeHomework8, user, syncToCloud8, submitResult8, hasSynced]);

  // Calculate grade (guard against division by zero)
  const percentage = homework8.totalPossible > 0
    ? Math.round((homework8.totalScore / homework8.totalPossible) * 100)
    : 0;
  const getGrade = () => {
    if (percentage >= 90) return { letter: 'A', color: 'text-green-500' };
    if (percentage >= 80) return { letter: 'B', color: 'text-blue-500' };
    if (percentage >= 70) return { letter: 'C', color: 'text-yellow-500' };
    if (percentage >= 60) return { letter: 'D', color: 'text-orange-500' };
    return { letter: 'F', color: 'text-red-500' };
  };
  const grade = getGrade();

  const handleRetry = async () => {
    resetHomework8();
    // Sync reset state to cloud
    if (user) {
      await syncToCloud8(user.uid);
    }
    router.push('/homework/hw8');
  };

  const handleRedoSection = async (sectionId: HW8SectionId) => {
    resetSection8(sectionId);
    // Sync reset state to cloud
    if (user) {
      await syncToCloud8(user.uid);
    }
    router.push(`/homework/hw8/section/${sectionId}`);
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
            <h1 className="text-3xl font-bold">Homework 8 Complete!</h1>
            <p className="text-muted-foreground">
              Great job completing Homework 8: 3rd Declension, Adjectives & Infinitives
            </p>
            {/* Sync indicator */}
            {user && (
              <div className="flex items-center justify-center gap-2 text-sm">
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-muted-foreground">Saving results...</span>
                  </>
                ) : hasSynced ? (
                  <>
                    <CloudCheck className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">Results saved to cloud</span>
                  </>
                ) : null}
              </div>
            )}
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
                    <p className="text-3xl font-bold">{homework8.totalScore}</p>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-3xl text-muted-foreground">/</div>
                  <div>
                    <p className="text-3xl font-bold">{homework8.totalPossible}</p>
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
                  const section = homework8.sections[sectionId] ?? {
                    status: 'not_started' as const,
                    score: 0,
                    totalQuestions: 0,
                  };
                  const meta = HW8_SECTION_META[sectionId];
                  const sectionPercentage = section.totalQuestions > 0
                    ? Math.round((section.score / section.totalQuestions) * 100)
                    : 0;

                  return (
                    <div key={sectionId} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          <span className="font-medium truncate">{meta.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm">
                            {section.score}/{section.totalQuestions} ({sectionPercentage}%)
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRedoSection(sectionId)}
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="sr-only">Redo {meta.title}</span>
                          </Button>
                        </div>
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
                      You have demonstrated a strong understanding of 3rd declension nouns, pronouns,
                      adjective paradigms, and infinitive forms. These are essential building blocks
                      for reading the New Testament in Greek with confidence!
                    </p>
                  </>
                )}
                {percentage >= 70 && percentage < 90 && (
                  <>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      Good progress!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You're developing solid skills with 3rd declension forms and adjective paradigms.
                      Review any sections where you scored below 80%, paying special attention to the
                      stem changes in πολύς/μέγας and the infinitive tense markers.
                    </p>
                  </>
                )}
                {percentage < 70 && (
                  <>
                    <p className="font-semibold text-orange-600 dark:text-orange-400">
                      Keep practicing!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The 3rd declension and irregular adjectives can be challenging. Review the genitive
                      singular forms to find 3rd declension stems, practice the two-stem pattern of
                      πολύς and μέγας, and memorize the infinitive endings (-ειν, -σαι, -κέναι).
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
            <Link href="/homework/hw8" className="w-full sm:w-auto">
              <Button className="gap-2 w-full">
                Back to HW8 Overview
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
