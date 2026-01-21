'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SectionId } from '@/types/homework';
import { SECTION_META } from '@/types/homework';

interface HomeworkProgressProps {
  currentSection: SectionId;
  sectionStatuses: Record<SectionId, 'not_started' | 'in_progress' | 'completed'>;
  onSectionClick?: (sectionId: SectionId) => void;
  canAccess: (sectionId: SectionId) => boolean;
}

export function HomeworkProgress({
  currentSection,
  sectionStatuses,
  onSectionClick,
  canAccess,
}: HomeworkProgressProps) {
  const sections: SectionId[] = [1, 2, 3, 4, 5];

  return (
    <div className="w-full">
      {/* Progress bar with steps */}
      <div className="flex items-center justify-between">
        {sections.map((sectionId, index) => {
          const status = sectionStatuses[sectionId];
          const isCurrent = sectionId === currentSection;
          const isAccessible = canAccess(sectionId);
          const meta = SECTION_META[sectionId];

          return (
            <div key={sectionId} className="flex items-center flex-1">
              {/* Step circle */}
              <button
                onClick={() => isAccessible && onSectionClick?.(sectionId)}
                disabled={!isAccessible}
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  status === 'completed' && 'bg-green-500 border-green-500 text-white',
                  status === 'in_progress' && 'bg-primary border-primary text-primary-foreground',
                  status === 'not_started' && isAccessible && 'bg-background border-muted-foreground/30 text-muted-foreground hover:border-primary',
                  status === 'not_started' && !isAccessible && 'bg-muted border-muted-foreground/20 text-muted-foreground/50 cursor-not-allowed',
                  isCurrent && status !== 'completed' && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
                title={meta.title}
              >
                {status === 'completed' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{sectionId}</span>
                )}
              </button>

              {/* Connector line (except for last) */}
              {index < sections.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    sectionStatuses[sectionId] === 'completed'
                      ? 'bg-green-500'
                      : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Section labels */}
      <div className="flex items-start justify-between mt-2">
        {sections.map((sectionId) => {
          const meta = SECTION_META[sectionId];
          const isCurrent = sectionId === currentSection;

          return (
            <div
              key={sectionId}
              className={cn(
                'flex-1 text-center px-1',
                isCurrent ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              <p className="text-xs font-medium truncate">{meta.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for use in section pages
export function HomeworkProgressCompact({
  currentSection,
  sectionStatuses,
}: Pick<HomeworkProgressProps, 'currentSection' | 'sectionStatuses'>) {
  const sections: SectionId[] = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1.5">
      {sections.map((sectionId) => {
        const status = sectionStatuses[sectionId];
        const isCurrent = sectionId === currentSection;

        return (
          <div
            key={sectionId}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              status === 'completed' && 'bg-green-500',
              status === 'in_progress' && 'bg-primary',
              status === 'not_started' && 'bg-muted-foreground/30',
              isCurrent && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
            )}
            title={SECTION_META[sectionId].title}
          />
        );
      })}
    </div>
  );
}
