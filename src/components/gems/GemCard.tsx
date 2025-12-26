'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { GreekWord } from '@/components/GreekWord';
import { GemBadge } from './GemBadge';
import type { GreekGem } from '@/types';

interface GemCardProps {
  gem: GreekGem;
  compact?: boolean;
  className?: string;
}

export function GemCard({ gem, compact = false, className }: GemCardProps) {
  // Truncate insight for preview
  const insightPreview = gem.insight.length > 150
    ? gem.insight.slice(0, 147) + '...'
    : gem.insight;

  return (
    <Link href={`/gems/${gem.id}`} className="block group">
      <Card
        className={cn(
          'transition-all duration-200',
          'hover:shadow-md hover:border-primary/30',
          'group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2',
          className
        )}
      >
        <CardContent className={cn('p-4', compact ? 'p-3' : 'p-4 sm:p-5')}>
          {/* Header: Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <GemBadge type="category" value={gem.category} size="sm" />
            <GemBadge type="level" value={gem.level} size="sm" />
          </div>

          {/* Title */}
          <h3 className={cn(
            'font-semibold text-foreground mb-2',
            compact ? 'text-base' : 'text-lg'
          )}>
            {gem.title}
          </h3>

          {/* Greek Text */}
          <div className="mb-3">
            <GreekWord
              greek={gem.greek}
              transliteration={gem.transliteration}
              showTransliteration={true}
              showAudio={false}
              size="md"
              className="items-start"
            />
          </div>

          {/* Reference */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{gem.reference}</span>
          </div>

          {/* Insight Preview */}
          {!compact && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {insightPreview}
            </p>
          )}

          {/* Read More Indicator */}
          <div className="flex items-center justify-end text-sm text-primary font-medium group-hover:text-primary/80">
            <span>Discover more</span>
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function GemCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="animate-pulse">
      <CardContent className={cn('p-4', compact ? 'p-3' : 'p-4 sm:p-5')}>
        {/* Badge skeletons */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="h-5 w-24 bg-muted rounded-full" />
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>

        {/* Title skeleton */}
        <div className="h-6 w-3/4 bg-muted rounded mb-2" />

        {/* Greek text skeleton */}
        <div className="mb-3">
          <div className="h-8 w-1/2 bg-muted rounded mb-1" />
          <div className="h-4 w-1/3 bg-muted rounded" />
        </div>

        {/* Reference skeleton */}
        <div className="h-4 w-24 bg-muted rounded mb-3" />

        {/* Insight skeleton */}
        {!compact && (
          <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
        )}

        {/* CTA skeleton */}
        <div className="flex justify-end">
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
