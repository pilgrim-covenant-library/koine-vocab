'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, AlertTriangle, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import type { GemSource } from '@/types';

interface GemInsightDisplayProps {
  insight: string;
  source: GemSource;
  whyEnglishMisses: string;
  referenceText: string;
  reference: string;
  className?: string;
}

export function GemInsightDisplay({
  insight,
  source,
  whyEnglishMisses,
  referenceText,
  reference,
  className,
}: GemInsightDisplayProps) {
  const [showFullReference, setShowFullReference] = useState(false);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Insight - Quote from Reformed/Puritan source */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
              <Quote className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-3">The Greek Insight</h3>
              <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground leading-relaxed">
                "{insight}"
              </blockquote>
              <p className="mt-3 text-sm text-muted-foreground">
                — <span className="font-medium text-foreground">{source.author}</span>,{' '}
                <em>{source.work}</em>
                {source.year && <span> ({source.year})</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why English Misses This */}
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">What English Translations Miss</h3>
              <p className="text-muted-foreground leading-relaxed">{whyEnglishMisses}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Greek Reference Text */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <button
            onClick={() => setShowFullReference(!showFullReference)}
            className={cn(
              'w-full flex items-center justify-between gap-2 text-left',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg -m-1 p-1'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted text-muted-foreground shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Greek Text</h3>
                <p className="text-sm text-muted-foreground">{reference}</p>
              </div>
            </div>
            <div className="p-2 rounded-full hover:bg-muted transition-colors">
              {showFullReference ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {showFullReference && (
            <div className="mt-4 pt-4 border-t">
              <p className="greek-text font-serif text-lg sm:text-xl leading-relaxed text-foreground">
                {referenceText}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
