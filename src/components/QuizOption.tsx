'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface QuizOptionProps {
  label: string;
  index: number;
  selected: boolean;
  correct?: boolean | null; // null = not revealed, true = correct, false = incorrect
  disabled?: boolean;
  onSelect: () => void;
}

// Memoized to prevent re-renders when other quiz state changes
export const QuizOption = memo(function QuizOption({
  label,
  index,
  selected,
  correct,
  disabled = false,
  onSelect,
}: QuizOptionProps) {
  const letters = ['A', 'B', 'C', 'D'];
  const isRevealed = correct !== null && correct !== undefined;

  // Build accessible label based on state
  let ariaLabel = `Option ${letters[index]}: ${label}`;
  if (isRevealed) {
    if (correct) {
      ariaLabel += ' - Correct answer';
    } else if (selected) {
      ariaLabel += ' - Incorrect, this was your choice';
    }
  } else if (selected) {
    ariaLabel += ' - Selected';
  }

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      aria-keyshortcuts={String(index + 1)}
      className={cn(
        'w-full p-4 rounded-xl border-2 transition-all text-left',
        'flex items-center gap-3',
        'disabled:cursor-not-allowed',
        !isRevealed && !selected && 'border-border hover:border-primary/50 hover:bg-muted/50',
        !isRevealed && selected && 'border-primary bg-primary/10',
        isRevealed && correct && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
        isRevealed && !correct && selected && 'border-red-500 bg-red-50 dark:bg-red-950',
        isRevealed && !correct && !selected && 'border-border opacity-50'
      )}
    >
      <span
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
          !isRevealed && !selected && 'bg-muted text-muted-foreground',
          !isRevealed && selected && 'bg-primary text-primary-foreground',
          isRevealed && correct && 'bg-emerald-500 text-white',
          isRevealed && !correct && selected && 'bg-red-500 text-white',
          isRevealed && !correct && !selected && 'bg-muted text-muted-foreground'
        )}
      >
        {isRevealed && correct && <Check className="w-5 h-5" />}
        {isRevealed && !correct && selected && <X className="w-5 h-5" />}
        {!isRevealed && letters[index]}
        {isRevealed && !correct && !selected && letters[index]}
      </span>
      <span className="flex-1 font-medium">{label}</span>
    </button>
  );
});
