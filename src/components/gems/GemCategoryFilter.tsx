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
import { GemCategory, GEM_CATEGORIES } from '@/types';

interface GemCategoryFilterProps {
  activeCategory: GemCategory | 'all';
  onCategoryChange: (category: GemCategory | 'all') => void;
  categoryCounts: Record<GemCategory, number>;
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

const categoryOrder: GemCategory[] = [
  'wordplay',
  'tense',
  'untranslatable',
  'emphatic',
  'article',
  'discourse',
  'chiasm',
  'double_meaning',
];

export function GemCategoryFilter({
  activeCategory,
  onCategoryChange,
  categoryCounts,
  className,
}: GemCategoryFilterProps) {
  return (
    <div className={cn('overflow-x-auto pb-2 -mb-2', className)}>
      <div className="flex gap-2 min-w-max">
        {/* All button */}
        <button
          onClick={() => onCategoryChange('all')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
          )}
        >
          All Categories
        </button>

        {/* Category buttons */}
        {categoryOrder.map((category) => {
          const info = GEM_CATEGORIES[category];
          const Icon = categoryIcons[category];
          const count = categoryCounts[category] || 0;
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
              title={info.description}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{info.label}</span>
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-white/20' : 'bg-background'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
