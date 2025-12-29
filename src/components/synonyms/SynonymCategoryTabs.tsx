'use client';

import { cn } from '@/lib/utils';
import { SYNONYM_CATEGORIES, type SynonymCategory } from '@/types';

interface SynonymCategoryTabsProps {
  activeCategory: SynonymCategory | 'all';
  onCategoryChange: (category: SynonymCategory | 'all') => void;
  categoryCounts: Record<SynonymCategory | 'all', number>;
  className?: string;
}

export function SynonymCategoryTabs({
  activeCategory,
  onCategoryChange,
  categoryCounts,
  className,
}: SynonymCategoryTabsProps) {
  // Build tabs with defensive checks for undefined values
  const categoryTabs = Object.entries(SYNONYM_CATEGORIES)
    .filter(([, info]) => info && typeof info.label === 'string')
    .map(([key, info]) => ({
      key: key as SynonymCategory,
      label: info.label,
    }));

  const tabs: { key: SynonymCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    ...categoryTabs,
  ];

  // Only show tabs that have content (with defensive check for categoryCounts)
  const visibleTabs = tabs.filter((tab) => {
    const count = categoryCounts?.[tab.key];
    return typeof count === 'number' && count > 0;
  });

  return (
    <div className={cn('overflow-x-auto pb-2 -mb-2', className)}>
      <div className="flex gap-2 min-w-max">
        {visibleTabs.map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onCategoryChange(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tab.label}
              <span className={cn('ml-1.5', isActive ? 'opacity-80' : 'opacity-60')}>
                ({categoryCounts?.[tab.key] ?? 0})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
