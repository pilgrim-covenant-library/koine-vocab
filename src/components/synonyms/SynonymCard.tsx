'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { SynonymBadge } from './SynonymBadge';
import type { SynonymGroup } from '@/types';

interface SynonymCardProps {
  group: SynonymGroup;
  className?: string;
}

export function SynonymCard({ group, className }: SynonymCardProps) {
  return (
    <Link href={`/synonyms/${group.id}`} className="block group">
      <Card
        className={cn(
          'transition-all duration-200',
          'hover:shadow-md hover:border-primary/30',
          'group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2',
          className
        )}
      >
        <CardContent className="p-4 sm:p-5">
          {/* Header: Category Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <SynonymBadge category={group.category} size="sm" />
            <span className="text-xs text-muted-foreground">
              {group.words.length} words
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground mb-2">
            {group.title}
          </h3>

          {/* English Word */}
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              English: <span className="font-medium text-foreground">{group.englishWord}</span>
            </span>
          </div>

          {/* Greek Words Preview */}
          <div className="flex flex-wrap gap-2 mb-3">
            {group.words.slice(0, 3).map((word) => (
              <span
                key={word.strongs}
                className="px-2 py-1 bg-muted/50 rounded text-sm font-greek"
              >
                {word.greek}
              </span>
            ))}
            {group.words.length > 3 && (
              <span className="px-2 py-1 text-sm text-muted-foreground">
                +{group.words.length - 3} more
              </span>
            )}
          </div>

          {/* Introduction */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {group.introduction}
          </p>

          {/* Read More Indicator */}
          <div className="flex items-center justify-end text-sm text-primary font-medium group-hover:text-primary/80">
            <span>View distinctions</span>
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function SynonymCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4 sm:p-5">
        {/* Badge skeleton */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="h-5 w-20 bg-muted rounded-full" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>

        {/* Title skeleton */}
        <div className="h-6 w-3/4 bg-muted rounded mb-2" />

        {/* English word skeleton */}
        <div className="h-4 w-32 bg-muted rounded mb-3" />

        {/* Greek words skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-7 w-16 bg-muted rounded" />
          <div className="h-7 w-14 bg-muted rounded" />
          <div className="h-7 w-18 bg-muted rounded" />
        </div>

        {/* Intro skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>

        {/* CTA skeleton */}
        <div className="flex justify-end">
          <div className="h-4 w-28 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
