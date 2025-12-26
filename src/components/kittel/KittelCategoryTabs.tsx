'use client';

import { cn } from '@/lib/utils';
import { KITTEL_CATEGORIES, type KittelCategory } from '@/types';

interface KittelCategoryTabsProps {
  activeCategory: KittelCategory | 'all';
  onCategoryChange: (category: KittelCategory | 'all') => void;
  categoryCounts: Record<KittelCategory | 'all', number>;
  className?: string;
}

export function KittelCategoryTabs({
  activeCategory,
  onCategoryChange,
  categoryCounts,
  className,
}: KittelCategoryTabsProps) {
  const tabs: { key: KittelCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    ...Object.entries(KITTEL_CATEGORIES).map(([key, info]) => ({
      key: key as KittelCategory,
      label: info.label,
    })),
  ];

  // Only show tabs that have content
  const visibleTabs = tabs.filter((tab) => categoryCounts[tab.key] > 0);

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
                ({categoryCounts[tab.key]})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
