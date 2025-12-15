'use client';

import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface StreakFireProps {
  streak: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function StreakFire({ streak, className, size = 'md' }: StreakFireProps) {
  const isActive = streak > 0;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Flame
        className={cn(
          sizeClasses[size],
          isActive ? 'text-orange-500 animate-fire' : 'text-muted-foreground'
        )}
      />
      <span
        className={cn(
          'font-bold',
          textSizes[size],
          isActive ? 'text-orange-500' : 'text-muted-foreground'
        )}
      >
        {streak}
      </span>
    </div>
  );
}

// Streak milestone celebration
interface StreakMilestoneProps {
  streak: number;
  show: boolean;
  onComplete?: () => void;
}

export function StreakMilestone({ streak, show, onComplete }: StreakMilestoneProps) {
  if (!show) return null;

  const getMilestoneMessage = (s: number) => {
    if (s === 7) return '1 Week Streak!';
    if (s === 14) return '2 Week Streak!';
    if (s === 30) return '1 Month Streak!';
    if (s === 100) return '100 Day Streak!';
    return `${s} Day Streak!`;
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
      onClick={onComplete}
    >
      <div className="bg-card rounded-2xl p-8 text-center animate-level-up shadow-xl">
        <Flame className="w-16 h-16 text-orange-500 mx-auto animate-fire" />
        <h2 className="text-2xl font-bold mt-4">{getMilestoneMessage(streak)}</h2>
        <p className="text-muted-foreground mt-2">Keep up the great work!</p>
      </div>
    </div>
  );
}
