'use client';

import { Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
  className?: string;
}

export function StreakCounter({ currentStreak, bestStreak, className }: StreakCounterProps) {
  const isHot = currentStreak >= 5;
  const isOnFire = currentStreak >= 10;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Current Streak */}
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'transition-all',
            isOnFire && 'animate-pulse',
            currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'
          )}
        >
          <Flame
            className={cn(
              'w-5 h-5 transition-transform',
              isHot && 'scale-110',
              isOnFire && 'scale-125'
            )}
          />
        </div>
        <span
          className={cn(
            'font-bold tabular-nums',
            currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground',
            isOnFire && 'text-lg'
          )}
        >
          {currentStreak}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          streak
        </span>
      </div>

      {/* Best Streak (only show if > 0) */}
      {bestStreak > 0 && (
        <div className="flex items-center gap-1.5 text-amber-500">
          <Trophy className="w-4 h-4" />
          <span className="font-medium tabular-nums text-sm">{bestStreak}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            best
          </span>
        </div>
      )}
    </div>
  );
}
