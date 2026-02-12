'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Crown, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import {
  COMMON_VOCAB_SECTION_META,
  WORDS_PER_SECTION,
  COMMON_VOCAB_COUNT,
  getCommonVocabSection,
  type CommonVocabSectionId,
} from '@/lib/commonVocab';
import { cn } from '@/lib/utils';

const SECTION_IDS: CommonVocabSectionId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type SectionStatus = 'not_started' | 'in_progress' | 'completed';

function getSectionStatus(learned: number, total: number): SectionStatus {
  if (learned === 0) return 'not_started';
  if (learned >= total) return 'completed';
  return 'in_progress';
}

function getScoreColor(percentage: number): { bar: string; text: string } {
  if (percentage >= 80) {
    return {
      bar: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400',
    };
  }
  if (percentage >= 60) {
    return {
      bar: 'bg-yellow-500',
      text: 'text-yellow-600 dark:text-yellow-400',
    };
  }
  return {
    bar: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
  };
}

export default function CommonVocabOverviewPage() {
  const router = useRouter();
  const { progress, commonVocabSectionScores } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute per-section progress
  const sectionData = SECTION_IDS.map((id) => {
    const sectionWords = getCommonVocabSection(id);
    const learned = sectionWords.filter(
      (w) => progress[w.id]?.repetitions !== undefined && progress[w.id].repetitions >= 1
    ).length;
    const status = getSectionStatus(learned, WORDS_PER_SECTION);
    const score = commonVocabSectionScores?.[id];
    return { id, learned, status, score };
  });

  // Overall progress
  const totalLearned = sectionData.reduce((sum, s) => sum + s.learned, 0);
  const overallPercentage = Math.round((totalLearned / COMMON_VOCAB_COUNT) * 100);

  const handleSectionClick = (sectionId: CommonVocabSectionId) => {
    router.push(`/learn/common-vocab/section/${sectionId}`);
  };

  const handleContinue = () => {
    // Find the first section that isn't fully completed
    for (const section of sectionData) {
      if (section.status !== 'completed') {
        router.push(`/learn/common-vocab/section/${section.id}`);
        return;
      }
    }
    // All sections completed — go to section 1 for review
    router.push('/learn/common-vocab/section/1');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link
            href="/learn"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Learn</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Title section */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <Crown className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Common NT Vocabulary</h1>
            <p className="text-lg text-muted-foreground">
              Master the 300 most common New Testament Greek words
            </p>
          </div>

          {/* Overall progress */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {totalLearned} / {COMMON_VOCAB_COUNT} words learned
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 rounded-full"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {overallPercentage}%
              </p>
            </CardContent>
          </Card>

          {/* Section cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sections</h2>
            <div className="grid gap-3">
              {sectionData.map(({ id, learned, status, score }) => {
                const meta = COMMON_VOCAB_SECTION_META[id];
                const sectionPercentage = Math.round((learned / WORDS_PER_SECTION) * 100);

                return (
                  <Card
                    key={id}
                    className={cn(
                      'transition-all cursor-pointer hover:border-amber-400',
                      status === 'completed' && 'border-green-200 dark:border-green-800'
                    )}
                    onClick={() => handleSectionClick(id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Section number/status icon */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
                            status === 'completed' && 'bg-green-500 text-white',
                            status === 'in_progress' && 'bg-amber-500 text-white',
                            status === 'not_started' && 'bg-muted text-muted-foreground'
                          )}
                        >
                          {status === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : status === 'in_progress' ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <span>{id}</span>
                          )}
                        </div>

                        {/* Section info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base">{meta.title}</h3>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {meta.description}
                          </p>
                          {/* Progress bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-300',
                                  score
                                    ? getScoreColor(Math.round((score.score / score.total) * 100)).bar
                                    : status === 'completed'
                                      ? 'bg-green-500'
                                      : 'bg-amber-500'
                                )}
                                style={{ width: `${sectionPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {learned}/{WORDS_PER_SECTION}
                            </span>
                          </div>
                        </div>

                        {/* Score / Question count */}
                        <div className="text-right shrink-0">
                          {score ? (
                            <div>
                              {(() => {
                                const scorePercentage = Math.round((score.score / score.total) * 100);
                                const colors = getScoreColor(scorePercentage);
                                return (
                                  <>
                                    <p className={cn('text-sm font-medium', colors.text)}>
                                      {score.score}/{score.total} ({scorePercentage}%)
                                    </p>
                                    <p className="text-xs text-muted-foreground">Best</p>
                                  </>
                                );
                              })()}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {WORDS_PER_SECTION} words
                            </p>
                          )}
                        </div>

                        {/* Retry button for scored sections */}
                        {score && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSectionClick(id);
                            }}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Retry
                          </Button>
                        )}

                        {/* Arrow */}
                        <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center pb-8">
            <Button
              size="lg"
              onClick={handleContinue}
              className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              {totalLearned === 0 ? 'Start Learning' : totalLearned >= COMMON_VOCAB_COUNT ? 'Review' : 'Continue'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
