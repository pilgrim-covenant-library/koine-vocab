'use client';

import {
  BookOpen,
  Church,
  Flame,
  GraduationCap,
  Scroll,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoryEra, STORY_ERAS } from '@/types';

interface StoryBadgeProps {
  era: StoryEra;
  size?: 'sm' | 'md';
  className?: string;
}

const eraIcons: Record<StoryEra, LucideIcon> = {
  reformation: Scroll,
  puritan: Church,
  eighteenth: Flame,
  nineteenth: GraduationCap,
  modern: BookOpen,
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
};

export function StoryBadge({ era, size = 'sm', className }: StoryBadgeProps) {
  const info = STORY_ERAS[era];
  const Icon = eraIcons[era];
  const colors = colorClasses[info.color] || colorClasses.blue;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {info.label}
    </span>
  );
}
