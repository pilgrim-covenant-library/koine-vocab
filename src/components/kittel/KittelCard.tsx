'use client';

import Link from 'next/link';
import { ChevronRight, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { KittelBadge } from './KittelBadge';
import type { KittelEntry } from '@/types';

interface KittelCardProps {
  entry: KittelEntry;
  className?: string;
}

export function KittelCard({ entry, className }: KittelCardProps) {
  return (
    <Link href={`/kittel/${entry.id}`} className="block group">
      <Card
        className={cn(
          'transition-all duration-200',
          'hover:shadow-md hover:border-primary/30',
          'group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2',
          className
        )}
      >
        <CardContent className="p-4 sm:p-5">
          {/* Header: Category Badge & Strong's */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <KittelBadge category={entry.category} size="sm" />
            <span className="text-xs text-muted-foreground font-mono">
              {entry.strongs}
            </span>
          </div>

          {/* Greek Word */}
          <div className="mb-2">
            <h3 className="font-greek text-2xl text-foreground">{entry.greek}</h3>
            <p className="text-sm text-muted-foreground">{entry.transliteration}</p>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-foreground mb-2">
            {entry.title}
          </h4>

          {/* Short Definition */}
          <div className="flex items-center gap-2 mb-3">
            <BookText className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{entry.shortDef}</span>
          </div>

          {/* Summary */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {entry.summary}
          </p>

          {/* Key Passages Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {entry.keyPassages.length} key passage{entry.keyPassages.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center text-primary font-medium group-hover:text-primary/80">
              <span>Study</span>
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function KittelCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4 sm:p-5">
        {/* Badge skeleton */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="h-5 w-24 bg-muted rounded-full" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>

        {/* Greek word skeleton */}
        <div className="mb-2">
          <div className="h-8 w-28 bg-muted rounded mb-1" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>

        {/* Title skeleton */}
        <div className="h-5 w-3/4 bg-muted rounded mb-2" />

        {/* Definition skeleton */}
        <div className="h-4 w-full bg-muted rounded mb-3" />

        {/* Summary skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>

        {/* Footer skeleton */}
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
