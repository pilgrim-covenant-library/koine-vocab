'use client';

import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { getButtonIntervals } from '@/lib/srs';
import type { WordProgress } from '@/types';

interface ReviewButtonsProps {
  onRate: (quality: number) => void;
  progress?: WordProgress | null;
  disabled?: boolean;
  className?: string;
}

const BUTTONS = [
  {
    key: 'again',
    label: 'Again',
    quality: 1,
    color: 'bg-red-500 hover:bg-red-600 text-white',
    description: 'Complete blackout',
  },
  {
    key: 'hard',
    label: 'Hard',
    quality: 3,
    color: 'bg-orange-500 hover:bg-orange-600 text-white',
    description: 'Correct with difficulty',
  },
  {
    key: 'good',
    label: 'Good',
    quality: 4,
    color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    description: 'Correct after hesitation',
  },
  {
    key: 'easy',
    label: 'Easy',
    quality: 5,
    color: 'bg-blue-500 hover:bg-blue-600 text-white',
    description: 'Perfect recall',
  },
];

export function ReviewButtons({
  onRate,
  progress,
  disabled = false,
  className,
}: ReviewButtonsProps) {
  const intervals = progress
    ? getButtonIntervals(progress)
    : { again: '<1d', hard: '1d', good: '6d', easy: '6d' };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p className="text-sm text-center text-muted-foreground">
        How well did you know this?
      </p>
      <div className="grid grid-cols-4 gap-2">
        {BUTTONS.map((button) => (
          <button
            key={button.key}
            onClick={() => onRate(button.quality)}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-lg transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'btn-press',
              button.color
            )}
          >
            <span className="font-semibold">{button.label}</span>
            <span className="text-xs opacity-80">
              {intervals[button.key as keyof typeof intervals]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Simplified version for quiz/typing modes
interface SimpleRatingProps {
  onCorrect: () => void;
  onIncorrect: () => void;
  disabled?: boolean;
  className?: string;
}

export function SimpleRating({
  onCorrect,
  onIncorrect,
  disabled = false,
  className,
}: SimpleRatingProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      <Button
        onClick={onIncorrect}
        disabled={disabled}
        variant="destructive"
        size="lg"
        className="flex-1"
      >
        Incorrect
      </Button>
      <Button
        onClick={onCorrect}
        disabled={disabled}
        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
        size="lg"
      >
        Correct
      </Button>
    </div>
  );
}
