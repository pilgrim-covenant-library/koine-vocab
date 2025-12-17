'use client';

import { forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle } from 'lucide-react';

interface TypingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  status?: 'idle' | 'correct' | 'incorrect' | 'close';
  hint?: string;
}

export const TypingInput = forwardRef<HTMLInputElement, TypingInputProps>(
  ({ value, onChange, onSubmit, status = 'idle', hint, className, ...props }, ref) => {
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onSubmit();
        }
      },
      [onSubmit]
    );

    const inputId = 'typing-answer-input';
    const hintId = 'typing-hint';

    return (
      <div className="w-full">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Type your answer"
            aria-describedby={hint ? hintId : undefined}
            aria-invalid={status === 'incorrect'}
            className={cn(
              'w-full px-4 py-4 text-lg rounded-xl border-2 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'placeholder:text-muted-foreground/50',
              status === 'idle' && 'border-border focus:border-primary focus:ring-primary/20',
              status === 'correct' &&
                'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 focus:ring-emerald-500/20',
              status === 'incorrect' &&
                'border-red-500 bg-red-50 dark:bg-red-950 focus:ring-red-500/20',
              status === 'close' &&
                'border-amber-500 bg-amber-50 dark:bg-amber-950 focus:ring-amber-500/20',
              className
            )}
            {...props}
          />
          {status !== 'idle' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2" aria-hidden="true">
              {status === 'correct' && <Check className="w-6 h-6 text-emerald-500" />}
              {status === 'incorrect' && <X className="w-6 h-6 text-red-500" />}
              {status === 'close' && <AlertCircle className="w-6 h-6 text-amber-500" />}
            </div>
          )}
        </div>
        {hint && status !== 'idle' && status !== 'correct' && (
          <p id={hintId} className="mt-2 text-sm text-muted-foreground text-center">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TypingInput.displayName = 'TypingInput';

// Feedback component for showing result
interface TypingFeedbackProps {
  status: 'correct' | 'incorrect' | 'close';
  correctAnswer: string;
  userAnswer: string;
  className?: string;
}

export function TypingFeedback({
  status,
  correctAnswer,
  userAnswer,
  className,
}: TypingFeedbackProps) {
  // Build screen reader announcement
  const announcement = status === 'correct'
    ? 'Correct!'
    : status === 'close'
    ? `Almost! The correct answer is ${correctAnswer}.`
    : `Incorrect. The correct answer is ${correctAnswer}.`;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={announcement}
      className={cn(
        'p-4 rounded-xl text-center',
        status === 'correct' &&
          'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
        status === 'incorrect' &&
          'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
        status === 'close' &&
          'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
        className
      )}
    >
      <p className="font-bold text-lg">
        {status === 'correct' && 'Correct!'}
        {status === 'incorrect' && 'Incorrect'}
        {status === 'close' && 'Almost!'}
      </p>
      {status !== 'correct' && (
        <div className="mt-2">
          <p className="text-sm">
            Correct answer: <strong>{correctAnswer}</strong>
          </p>
          <p className="text-xs mt-1 opacity-80">
            Your answer: {userAnswer || '(empty)'}
          </p>
        </div>
      )}
    </div>
  );
}
