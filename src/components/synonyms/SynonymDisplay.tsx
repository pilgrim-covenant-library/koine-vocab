'use client';

import { Quote, BookOpen, Lightbulb, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import type { SynonymGroup, SynonymWord } from '@/types';

interface SynonymDisplayProps {
  group: SynonymGroup;
  className?: string;
}

export function SynonymDisplay({ group, className }: SynonymDisplayProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Introduction */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-muted text-muted-foreground shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Why These Distinctions Matter</h3>
              <p className="text-muted-foreground leading-relaxed">
                {group.introduction}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word Comparisons */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">The Greek Words</h3>
        {group.words.map((word) => (
          <SynonymWordCard key={word.strongs} word={word} />
        ))}
      </div>

      {/* Vine's Quote */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
              <Quote className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">From Vine's Dictionary</h3>
              <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground leading-relaxed">
                "{group.vineQuote}"
              </blockquote>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Verse */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <BookText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Example: {group.exampleVerse.reference}
              </h3>
              <p className="font-greek text-lg text-foreground mb-2">
                {group.exampleVerse.greek}
              </p>
              <p className="text-muted-foreground mb-2">
                {group.exampleVerse.english}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{group.exampleVerse.wordHighlighted}</span> is used here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practical Tip */}
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Practical Tip</h3>
              <p className="text-muted-foreground leading-relaxed">{group.practicalTip}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Attribution */}
      <p className="text-sm text-muted-foreground text-center">
        Source: <span className="font-medium text-foreground">W.E. Vine</span>,{' '}
        <em>Vine's Expository Dictionary of New Testament Words</em>
      </p>
    </div>
  );
}

// Individual word card within the group
function SynonymWordCard({ word }: { word: SynonymWord }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h4 className="font-greek text-xl text-foreground">{word.greek}</h4>
            <p className="text-sm text-muted-foreground">{word.transliteration}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">{word.strongs}</span>
            <p className="text-xs text-muted-foreground">{word.ntUsage}x in NT</p>
          </div>
        </div>
        <p className="font-medium text-foreground mb-2">{word.shortDef}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{word.nuance}</p>
      </CardContent>
    </Card>
  );
}
