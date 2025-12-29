'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { SynonymBadge } from './SynonymBadge';
import type { SynonymGroup } from '@/types';

interface SynonymCardProps {
  group: SynonymGroup | null | undefined;
  className?: string;
}

export function SynonymCard({ group, className }: SynonymCardProps) {
  // Defensive: handle null/undefined group
  if (!group) {
    return (
      <Card className={cn('opacity-50', className)}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Content unavailable</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Defensive: ensure required fields exist with fallbacks
  const groupId = group.id || 'unknown';
  const category = group.category || 'other';
  const title = group.title || 'Untitled Group';
  const englishWord = group.englishWord || '—';
  const words = Array.isArray(group.words) ? group.words : [];
  const introduction = group.introduction || '';

  return (
    <Link href={`/synonyms/${groupId}`} className="block group">
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
            <SynonymBadge category={category} size="sm" />
            <span className="text-xs text-muted-foreground">
              {words.length} word{words.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground mb-2">
            {title}
          </h3>

          {/* English Word */}
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              English: <span className="font-medium text-foreground">{englishWord}</span>
            </span>
          </div>

          {/* Greek Words Preview */}
          {words.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {words.slice(0, 3).map((word, index) => (
                <span
                  key={word?.strongs || `word-${index}`}
                  className="px-2 py-1 bg-muted/50 rounded text-sm font-greek"
                >
                  {word?.greek || '—'}
                </span>
              ))}
              {words.length > 3 && (
                <span className="px-2 py-1 text-sm text-muted-foreground">
                  +{words.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">No words available</p>
          )}

          {/* Introduction */}
          {introduction && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {introduction}
            </p>
          )}

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
