'use client';

import { Quote, BookOpen, Lightbulb, BookText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import type { SynonymGroup, SynonymWord } from '@/types';

interface SynonymDisplayProps {
  group: SynonymGroup;
  className?: string;
}

/**
 * Validates that a SynonymGroup has all required fields
 * Returns an array of missing field names, or empty array if valid
 */
function validateSynonymGroup(group: SynonymGroup | null | undefined): string[] {
  if (!group) return ['group'];

  const missing: string[] = [];

  if (!group.introduction) missing.push('introduction');
  if (!group.words || !Array.isArray(group.words)) missing.push('words');
  if (!group.vineQuote) missing.push('vineQuote');
  if (!group.exampleVerse) missing.push('exampleVerse');
  if (group.exampleVerse && !group.exampleVerse.reference) missing.push('exampleVerse.reference');
  if (!group.practicalTip) missing.push('practicalTip');

  return missing;
}

export function SynonymDisplay({ group, className }: SynonymDisplayProps) {
  // Defensive: validate group data
  const missingFields = validateSynonymGroup(group);

  if (missingFields.length > 0) {
    return (
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Content Unavailable</h3>
              <p className="text-muted-foreground">
                Some content for this synonym group is currently unavailable.
                Please try again later or report this issue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Defensive: ensure words array exists and has items
  const words = group.words ?? [];
  const exampleVerse = group.exampleVerse ?? { reference: '', greek: '', english: '', wordHighlighted: '' };

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
                {group.introduction || 'Introduction not available.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word Comparisons */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">The Greek Words</h3>
        {words.length > 0 ? (
          words.map((word, index) => (
            <SynonymWordCard key={word?.strongs || `word-${index}`} word={word} />
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-muted-foreground">
              No Greek words available for this group.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Vine's Quote */}
      {group.vineQuote && (
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
      )}

      {/* Example Verse */}
      {exampleVerse.reference && (
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <BookText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Example: {exampleVerse.reference}
                </h3>
                {exampleVerse.greek && (
                  <p className="font-greek text-lg text-foreground mb-2">
                    {exampleVerse.greek}
                  </p>
                )}
                {exampleVerse.english && (
                  <p className="text-muted-foreground mb-2">
                    {exampleVerse.english}
                  </p>
                )}
                {exampleVerse.wordHighlighted && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{exampleVerse.wordHighlighted}</span> is used here
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practical Tip */}
      {group.practicalTip && (
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
      )}

      {/* Source Attribution */}
      <p className="text-sm text-muted-foreground text-center">
        Source: <span className="font-medium text-foreground">W.E. Vine</span>,{' '}
        <em>Vine's Expository Dictionary of New Testament Words</em>
      </p>
    </div>
  );
}

// Individual word card within the group
function SynonymWordCard({ word }: { word: SynonymWord | null | undefined }) {
  // Defensive: handle null/undefined word
  if (!word) {
    return (
      <Card>
        <CardContent className="p-4 text-muted-foreground">
          Word data unavailable.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h4 className="font-greek text-xl text-foreground">{word.greek || '—'}</h4>
            <p className="text-sm text-muted-foreground">{word.transliteration || '—'}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">{word.strongs || '—'}</span>
            <p className="text-xs text-muted-foreground">
              {typeof word.ntUsage === 'number' ? `${word.ntUsage}x in NT` : '—'}
            </p>
          </div>
        </div>
        <p className="font-medium text-foreground mb-2">{word.shortDef || 'Definition not available.'}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{word.nuance || 'No nuance description available.'}</p>
      </CardContent>
    </Card>
  );
}
