'use client';

import { cn } from '@/lib/utils';
import { StoryEra, STORY_ERAS } from '@/types';

interface StoryEraTabsProps {
  activeEra: StoryEra | 'all';
  onEraChange: (era: StoryEra | 'all') => void;
  storyCounts?: Record<StoryEra | 'all', number>;
  className?: string;
}

const colorClasses: Record<string, string> = {
  amber: 'data-[active=true]:bg-amber-100 data-[active=true]:text-amber-700 dark:data-[active=true]:bg-amber-900/30 dark:data-[active=true]:text-amber-300',
  emerald: 'data-[active=true]:bg-emerald-100 data-[active=true]:text-emerald-700 dark:data-[active=true]:bg-emerald-900/30 dark:data-[active=true]:text-emerald-300',
  blue: 'data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700 dark:data-[active=true]:bg-blue-900/30 dark:data-[active=true]:text-blue-300',
  purple: 'data-[active=true]:bg-purple-100 data-[active=true]:text-purple-700 dark:data-[active=true]:bg-purple-900/30 dark:data-[active=true]:text-purple-300',
  rose: 'data-[active=true]:bg-rose-100 data-[active=true]:text-rose-700 dark:data-[active=true]:bg-rose-900/30 dark:data-[active=true]:text-rose-300',
};

export function StoryEraTabs({
  activeEra,
  onEraChange,
  storyCounts,
  className,
}: StoryEraTabsProps) {
  const eras = Object.entries(STORY_ERAS) as [StoryEra, typeof STORY_ERAS[StoryEra]][];

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* All tab */}
      <button
        onClick={() => onEraChange('all')}
        data-active={activeEra === 'all'}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
          'hover:bg-muted',
          'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground'
        )}
      >
        All
        {storyCounts && (
          <span className="ml-1.5 text-xs opacity-70">({storyCounts.all})</span>
        )}
      </button>

      {/* Era tabs */}
      {eras.map(([era, info]) => (
        <button
          key={era}
          onClick={() => onEraChange(era)}
          data-active={activeEra === era}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            'hover:bg-muted text-muted-foreground',
            colorClasses[info.color]
          )}
        >
          {info.label}
          {storyCounts && storyCounts[era] > 0 && (
            <span className="ml-1.5 text-xs opacity-70">({storyCounts[era]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
