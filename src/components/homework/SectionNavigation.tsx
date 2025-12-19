'use client';

import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SectionNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  hasAnswered: boolean;
  isLastQuestion: boolean;
  isLastSection: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  className?: string;
}

export function SectionNavigation({
  currentIndex,
  totalQuestions,
  hasAnswered,
  isLastQuestion,
  isLastSection,
  onPrevious,
  onNext,
  onComplete,
  className,
}: SectionNavigationProps) {
  const canGoPrevious = currentIndex > 0;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Previous button */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      {/* Question counter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        {/* Progress dots */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors',
                i === currentIndex
                  ? 'bg-primary'
                  : i < currentIndex
                  ? 'bg-green-500'
                  : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>

      {/* Next/Complete button */}
      {isLastQuestion ? (
        <Button
          onClick={onComplete}
          disabled={!hasAnswered}
          className="gap-2"
        >
          {isLastSection ? (
            <>
              Finish Homework
              <Check className="w-4 h-4" />
            </>
          ) : (
            <>
              Next Section
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!hasAnswered}
          className="gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// Question progress bar
interface QuestionProgressBarProps {
  current: number;
  total: number;
  answered: number;
  className?: string;
}

export function QuestionProgressBar({
  current,
  total,
  answered,
  className,
}: QuestionProgressBarProps) {
  const percentage = (answered / total) * 100;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{answered}/{total} answered</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
