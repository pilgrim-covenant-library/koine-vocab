'use client';

import Link from 'next/link';
import { ChevronRight, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { StoryBadge } from './StoryBadge';
import type { GreekLearningStory } from '@/types';

interface StoryCardProps {
  story: GreekLearningStory;
  className?: string;
}

export function StoryCard({ story, className }: StoryCardProps) {
  return (
    <Link href={`/stories/${story.id}`} className="block group">
      <Card
        className={cn(
          'transition-all duration-200',
          'hover:shadow-md hover:border-primary/30',
          'group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2',
          className
        )}
      >
        <CardContent className="p-4 sm:p-5">
          {/* Header: Era Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <StoryBadge era={story.era} size="sm" />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground mb-2">
            {story.title}
          </h3>

          {/* Figure info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium">{story.figure}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{story.years}</span>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {story.summary}
          </p>

          {/* Key Lesson teaser */}
          <p className="text-xs text-muted-foreground italic mb-3 line-clamp-1">
            Key lesson: {story.keyLesson}
          </p>

          {/* Read More Indicator */}
          <div className="flex items-center justify-end text-sm text-primary font-medium group-hover:text-primary/80">
            <span>Read story</span>
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function StoryCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4 sm:p-5">
        {/* Badge skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-24 bg-muted rounded-full" />
        </div>

        {/* Title skeleton */}
        <div className="h-6 w-3/4 bg-muted rounded mb-2" />

        {/* Figure info skeleton */}
        <div className="flex items-center gap-4 mb-3">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>

        {/* Summary skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>

        {/* CTA skeleton */}
        <div className="flex justify-end">
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
