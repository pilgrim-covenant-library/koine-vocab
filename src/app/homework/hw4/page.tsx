'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, HelpCircle, Loader2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { useAuthStore } from '@/stores/authStore';
import { HomeworkProgress } from '@/components/homework/HomeworkProgress';
import { HW4_SECTION_META, type HW4SectionId } from '@/types/homework';
import { cn } from '@/lib/utils';

function Homework4Content() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    homework4,
    startHomework4,
    canAccessSection4,
    getOverallProgress4,
    loadFromCloud4,
    syncToCloud4,
    resetSection4,
  } = useHomeworkStore();

  const [isLoading, setIsLoading] = useState(true);
  const progress = getOverallProgress4();
  const sections: HW4SectionId[] = [1, 2, 3, 4, 5, 6];

  // Load from cloud and start homework on mount
  useEffect(() => {
    const initializeHomework = async () => {
      if (user) {
        // Try to load progress from cloud first
        await loadFromCloud4(user.uid);
      }

      // Start homework if not started
      if (homework4.status === 'not_started') {
        startHomework4();
      }

      // Sync initial state to cloud
      if (user) {
        await syncToCloud4(user.uid);
      }

      setIsLoading(false);
    };

    initializeHomework();
  }, [user, homework4.status, startHomework4, loadFromCloud4, syncToCloud4]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading homework...</p>
        </div>
      </div>
    );
  }

  const handleSectionClick = (sectionId: HW4SectionId) => {
    if (canAccessSection4(sectionId)) {
      router.push(`/homework/hw4/section/${sectionId}`);
    }
  };

  const handleContinue = () => {
    // Find the first incomplete section
    for (const sectionId of sections) {
      const section = homework4.sections[sectionId];
      if (section.status !== 'completed') {
        router.push(`/homework/hw4/section/${sectionId}`);
        return;
      }
    }
    // All complete, go to completion page
    router.push('/homework/hw4/complete');
  };

  const handleRedoSection = (sectionId: HW4SectionId) => {
    resetSection4(sectionId);
    router.push(`/homework/hw4/section/${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/homework"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Homework</span>
          </Link>
          <Link
            href="/homework/help/verb-paradigms"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Help</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Title section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Homework 4</h1>
            <p className="text-lg text-muted-foreground">
              Future Tense, Participles, Pronouns & Conjunctions
            </p>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              This homework covers the future active indicative, present and aorist active
              masculine participles, 1st & 2nd person personal pronouns, and common Greek conjunctions.
            </p>
          </div>

          {/* Progress indicator */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Your Progress</CardTitle>
              <CardDescription>
                {progress.completed === 6
                  ? 'All sections completed!'
                  : `${progress.completed} of 6 sections completed`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomeworkProgress
                currentSection={homework4.currentSection}
                sectionStatuses={Object.fromEntries(
                  sections.map((id) => [id, homework4.sections[id]?.status ?? 'not_started'])
                ) as Record<HW4SectionId, 'not_started' | 'in_progress' | 'completed'>}
                onSectionClick={handleSectionClick}
                canAccess={canAccessSection4}
                sectionMeta={HW4_SECTION_META}
                sectionIds={[1, 2, 3, 4, 5, 6]}
              />
            </CardContent>
          </Card>

          {/* Section cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sections</h2>
            <div className="grid gap-4">
              {sections.map((sectionId) => {
                const meta = HW4_SECTION_META[sectionId];
                const section = homework4.sections[sectionId] ?? {
                  status: 'not_started' as const,
                  currentIndex: 0,
                  answers: [] as { questionId: string; userAnswer: string | number; isCorrect: boolean }[],
                  score: 0,
                  totalQuestions: 0,
                };

                return (
                  <Card
                    key={sectionId}
                    className={cn(
                      'transition-all',
                      'hover:border-primary cursor-pointer'
                    )}
                    onClick={() => handleSectionClick(sectionId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Section number/status */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                            section.status === 'completed' &&
                              'bg-green-500 text-white',
                            section.status === 'in_progress' &&
                              'bg-primary text-primary-foreground',
                            section.status === 'not_started' &&
                              'bg-muted text-muted-foreground'
                          )}
                        >
                          {section.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : section.status === 'in_progress' ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <span className="font-semibold">{sectionId}</span>
                          )}
                        </div>

                        {/* Section info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{meta.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {meta.description}
                          </p>
                        </div>

                        {/* Question count / Score */}
                        <div className="text-right shrink-0">
                          {section.status === 'completed' ? (
                            <div>
                              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                {section.score}/{section.totalQuestions}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Score
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {meta.questionCount} questions
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Redo button for completed sections */}
                        {section.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRedoSection(sectionId);
                            }}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Redo
                          </Button>
                        )}

                        {/* Arrow */}
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            {progress.completed === 6 ? (
              <Link href="/homework/hw4/complete">
                <Button size="lg" className="gap-2">
                  <CheckCircle className="w-5 h-5" />
                  View Results
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={handleContinue} className="gap-2">
                {progress.completed === 0 ? 'Start Homework' : 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Allow anyone to access homework (cloud sync still works if logged in)
export default function Homework4Page() {
  return <Homework4Content />;
}
