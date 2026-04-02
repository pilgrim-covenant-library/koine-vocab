'use client';

import { ChevronLeft, ChevronRight, Flag, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ExamNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  globalQuestionNumber: number;
  globalTotal: number;
  isFlagged: boolean;
  isLastQuestion: boolean;
  isLastSection: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
  onReview: () => void;
}

export function ExamNavigation({
  currentIndex,
  globalQuestionNumber,
  globalTotal,
  isFlagged,
  isLastQuestion,
  isLastSection,
  onPrevious,
  onNext,
  onToggleFlag,
  onReview,
}: ExamNavigationProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={globalQuestionNumber <= 1}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Q {globalQuestionNumber} of {globalTotal}
        </span>
        <button
          onClick={onToggleFlag}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            isFlagged
              ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/30'
              : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
          )}
          title={isFlagged ? 'Remove flag' : 'Flag for review'}
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {isLastQuestion && isLastSection ? (
        <Button onClick={onReview} className="gap-2">
          Review & Submit
          <ClipboardCheck className="w-4 h-4" />
        </Button>
      ) : (
        <Button onClick={onNext} className="gap-2">
          {isLastQuestion ? 'Next Section' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
