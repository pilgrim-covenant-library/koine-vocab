'use client';

import { cn } from '@/lib/utils';
import { getLevelProgress, getLevelTitle, getXPForNextLevel } from '@/lib/xp';

interface XPBarProps {
  xp: number;
  level: number;
  className?: string;
  showDetails?: boolean;
}

export function XPBar({ xp, level, className, showDetails = true }: XPBarProps) {
  const progress = getLevelProgress(xp);
  const nextLevelXP = getXPForNextLevel(level);
  const title = getLevelTitle(level);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-purple-500">Lv. {level}</span>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        {showDetails && (
          <span className="text-xs text-muted-foreground">
            {xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Floating XP gain indicator
interface XPGainProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

export function XPGain({ amount, show, onComplete }: XPGainProps) {
  if (!show) return null;

  return (
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 animate-xp-gain"
      onAnimationEnd={onComplete}
    >
      <span className="text-lg font-bold text-purple-500">+{amount} XP</span>
    </div>
  );
}
