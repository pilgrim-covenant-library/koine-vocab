'use client';

import { useState } from 'react';
import { BookOpen, Brain, Trophy, Zap, ChevronRight, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { cn } from '@/lib/utils';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    icon: BookOpen,
    title: 'Welcome to Koine Greek Vocab!',
    description: 'Master New Testament Greek vocabulary with our spaced repetition system. Study smarter, not harder.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Brain,
    title: 'Learn with Spaced Repetition',
    description: 'Our SM-2 algorithm schedules reviews at optimal intervals. Words you struggle with appear more often.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Zap,
    title: 'Multiple Learning Modes',
    description: 'Flashcards, quizzes, and typing practice. Mix it up to reinforce your memory in different ways.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Trophy,
    title: 'Track Your Progress',
    description: 'Earn XP, level up, and unlock achievements. Stay motivated with streaks and study milestones.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
];

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full relative overflow-hidden">
        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        <CardContent className="pt-12 pb-8 text-center">
          {/* Icon */}
          <div
            className={cn(
              'w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6',
              step.bgColor
            )}
          >
            <Icon className={cn('w-10 h-10', step.color)} />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
          <p className="text-muted-foreground mb-8 px-4">{step.description}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6" role="tablist" aria-label="Onboarding progress">
            {STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                )}
                aria-label={`Go to step ${index + 1}`}
                aria-selected={index === currentStep}
                role="tab"
              />
            ))}
          </div>

          {/* Action button */}
          <Button size="lg" className="w-full" onClick={handleNext}>
            {isLastStep ? (
              "Let's Get Started!"
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>

          {/* Step counter */}
          <p className="text-xs text-muted-foreground mt-4">
            {currentStep + 1} of {STEPS.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to check if user is new (no progress)
export function useIsNewUser(progress: Record<string, unknown>, stats: { totalReviews: number }) {
  return Object.keys(progress).length === 0 && stats.totalReviews === 0;
}
