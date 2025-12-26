'use client';

import { Quote, BookOpen, Lightbulb, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import type { GemSource } from '@/types';

interface StoryDisplayProps {
  story: string;
  greekMethod: string;
  keyLesson: string;
  quote?: string;
  source: GemSource;
  className?: string;
}

export function StoryDisplay({
  story,
  greekMethod,
  keyLesson,
  quote,
  source,
  className,
}: StoryDisplayProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Inspirational Quote (if available) */}
      {quote && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                <Quote className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground leading-relaxed">
                  "{quote}"
                </blockquote>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* The Story */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-muted text-muted-foreground shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-3">The Story</h3>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {story}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How They Learned Greek */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">How They Learned Greek</h3>
              <p className="text-muted-foreground leading-relaxed">{greekMethod}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Lesson for You */}
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Key Lesson for You</h3>
              <p className="text-muted-foreground leading-relaxed">{keyLesson}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Attribution */}
      <p className="text-sm text-muted-foreground text-center">
        Source: <span className="font-medium text-foreground">{source.author}</span>,{' '}
        <em>{source.work}</em>
        {source.year && <span> ({source.year})</span>}
      </p>
    </div>
  );
}
