'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHomeworkStore } from '@/stores/homeworkStore';
import { HomeworkProgress } from '@/components/homework/HomeworkProgress';
import { SECTION_META, type SectionId } from '@/types/homework';
import { cn } from '@/lib/utils';

export default function Homework1Page() {
  const router = useRouter();
  const {
    homework1,
    startHomework,
    canAccessSection,
    getOverallProgress,
  } = useHomeworkStore();

  const progress = getOverallProgress();
  const sections: SectionId[] = [1, 2, 3, 4, 5];

  // Start homework if not started
  useEffect(() => {
    if (homework1.status === 'not_started') {
      startHomework();
    }
  }, [homework1.status, startHomework]);

  const handleSectionClick = (sectionId: SectionId) => {
    if (canAccessSection(sectionId)) {
      router.push(`/homework/hw1/section/${sectionId}`);
    }
  };

  const handleContinue = () => {
    // Find the first incomplete section
    for (const sectionId of sections) {
      const section = homework1.sections[sectionId];
      if (section.status !== 'completed') {
        router.push(`/homework/hw1/section/${sectionId}`);
        return;
      }
    }
    // All complete, go to completion page
    router.push('/homework/hw1/complete');
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
            href="/homework/help/transliteration"
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
            <h1 className="text-3xl font-bold">Homework 1</h1>
            <p className="text-lg text-muted-foreground">
              Greek Alphabet Foundations
            </p>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              This homework is designed for students who have just learned the Greek
              alphabet. Complete all 5 sections to finish.
            </p>
          </div>

          {/* Progress indicator */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Your Progress</CardTitle>
              <CardDescription>
                {progress.completed === 5
                  ? 'All sections completed!'
                  : `${progress.completed} of 5 sections completed`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomeworkProgress
                currentSection={homework1.currentSection}
                sectionStatuses={Object.fromEntries(
                  sections.map((id) => [id, homework1.sections[id].status])
                ) as Record<SectionId, 'not_started' | 'in_progress' | 'completed'>}
                onSectionClick={handleSectionClick}
                canAccess={canAccessSection}
              />
            </CardContent>
          </Card>

          {/* Section cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sections</h2>
            <div className="grid gap-4">
              {sections.map((sectionId) => {
                const meta = SECTION_META[sectionId];
                const section = homework1.sections[sectionId];
                const isAccessible = canAccessSection(sectionId);

                return (
                  <Card
                    key={sectionId}
                    className={cn(
                      'transition-all',
                      !isAccessible && 'opacity-50',
                      isAccessible && 'hover:border-primary cursor-pointer'
                    )}
                    onClick={() => isAccessible && handleSectionClick(sectionId)}
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
                            section.status === 'not_started' && isAccessible &&
                              'bg-muted text-muted-foreground',
                            section.status === 'not_started' && !isAccessible &&
                              'bg-muted/50 text-muted-foreground/50'
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

                        {/* Arrow */}
                        {isAccessible && (
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            {progress.completed === 5 ? (
              <Link href="/homework/hw1/complete">
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
