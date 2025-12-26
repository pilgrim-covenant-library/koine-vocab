'use client';

import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GemLevel, GEM_LEVELS } from '@/types';

interface GemLevelTabsProps {
  activeLevel: GemLevel | 'all';
  onLevelChange: (level: GemLevel | 'all') => void;
  gemCounts: Record<GemLevel, number>;
  unlockedLevels: GemLevel[];
  totalGems?: number;
  className?: string;
}

const levelOrder: (GemLevel | 'all')[] = ['all', 'beginner', 'intermediate', 'advanced', 'expert'];

const colorClasses: Record<string, { active: string; inactive: string }> = {
  all: {
    active: 'bg-primary text-primary-foreground',
    inactive: 'text-muted-foreground hover:text-foreground hover:bg-muted',
  },
  emerald: {
    active: 'bg-emerald-500 text-white',
    inactive: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
  },
  blue: {
    active: 'bg-blue-500 text-white',
    inactive: 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  },
  amber: {
    active: 'bg-amber-500 text-white',
    inactive: 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30',
  },
  purple: {
    active: 'bg-purple-500 text-white',
    inactive: 'text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30',
  },
};

export function GemLevelTabs({
  activeLevel,
  onLevelChange,
  gemCounts,
  unlockedLevels,
  totalGems = 0,
  className,
}: GemLevelTabsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {levelOrder.map((level) => {
        if (level === 'all') {
          const isActive = activeLevel === 'all';
          const colors = colorClasses.all;

          return (
            <button
              key="all"
              onClick={() => onLevelChange('all')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive ? colors.active : colors.inactive
              )}
            >
              <span>All</span>
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-white/20' : 'bg-muted'
              )}>
                {totalGems}
              </span>
            </button>
          );
        }

        const levelInfo = GEM_LEVELS[level];
        const isActive = activeLevel === level;
        const isUnlocked = unlockedLevels.includes(level);
        const count = gemCounts[level] || 0;
        const colors = colorClasses[levelInfo.color] || colorClasses.blue;

        return (
          <button
            key={level}
            onClick={() => isUnlocked && onLevelChange(level)}
            disabled={!isUnlocked}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isUnlocked
                ? isActive
                  ? colors.active
                  : colors.inactive
                : 'text-muted-foreground/50 cursor-not-allowed'
            )}
            title={isUnlocked ? levelInfo.description : `View ${levelInfo.minGems} gems to unlock`}
          >
            {!isUnlocked && <Lock className="w-3.5 h-3.5" />}
            <span>{levelInfo.label}</span>
            {isUnlocked && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-white/20' : 'bg-muted'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
