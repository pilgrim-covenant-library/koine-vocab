'use client';

import {
  Sparkles,
  Clock,
  Languages,
  FlipHorizontal2,
  Volume2,
  FileText,
  GitBranch,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GemCategory, GemLevel, GEM_CATEGORIES, GEM_LEVELS } from '@/types';

interface GemBadgeProps {
  type: 'category' | 'level';
  value: GemCategory | GemLevel;
  size?: 'sm' | 'md';
  className?: string;
}

const categoryIcons: Record<GemCategory, LucideIcon> = {
  wordplay: Sparkles,
  tense: Clock,
  untranslatable: Languages,
  chiasm: FlipHorizontal2,
  emphatic: Volume2,
  article: FileText,
  discourse: GitBranch,
  double_meaning: Layers,
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
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
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-800',
  },
};

export function GemBadge({ type, value, size = 'sm', className }: GemBadgeProps) {
  if (type === 'category') {
    const category = value as GemCategory;
    const info = GEM_CATEGORIES[category];
    const Icon = categoryIcons[category];
    const colors = colorClasses[info.color] || colorClasses.purple;

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

  // Level badge
  const level = value as GemLevel;
  const info = GEM_LEVELS[level];
  const colors = colorClasses[info.color] || colorClasses.blue;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium uppercase tracking-wide',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className
      )}
    >
      {info.label}
    </span>
  );
}
