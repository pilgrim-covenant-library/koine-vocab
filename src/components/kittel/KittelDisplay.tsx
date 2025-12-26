'use client';

import {
  BookOpen,
  ScrollText,
  History,
  BookText,
  Lightbulb,
  Link2,
  Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import type { KittelEntry } from '@/types';

interface KittelDisplayProps {
  entry: KittelEntry;
  className?: string;
}

export function KittelDisplay({ entry, className }: KittelDisplayProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-muted text-muted-foreground shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Overview</h3>
              <p className="text-muted-foreground leading-relaxed">
                {entry.summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classical Greek Usage */}
      <Card className="border-l-4 border-l-slate-500">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 shrink-0">
              <Library className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Classical Greek Usage</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {entry.classicalGreek}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LXX / Old Testament Background */}
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <ScrollText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Old Testament / LXX Background
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {entry.lxxBackground}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intertestamental Period (if available) */}
      {entry.intertestamental && (
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Intertestamental Developments
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {entry.intertestamental}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Testament Usage */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <BookText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                New Testament Usage
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {entry.ntUsage}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Passages */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Key Passages</h3>
        {entry.keyPassages.map((passage, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <h4 className="font-semibold text-foreground mb-2">
                {passage.reference}
              </h4>
              <p className="font-greek text-lg text-foreground mb-2">
                {passage.greek}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {passage.significance}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Theological Significance */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Theological Significance
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {entry.theologicalSignificance}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Words (if available) */}
      {entry.relatedWords && entry.relatedWords.length > 0 && (
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-muted text-muted-foreground shrink-0">
                <Link2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-3">Related Words</h3>
                <div className="space-y-3">
                  {entry.relatedWords.map((related, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div>
                        <span className="font-greek text-lg text-foreground">
                          {related.greek}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({related.transliteration})
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        — {related.relationship}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Attribution */}
      <p className="text-sm text-muted-foreground text-center">
        Source: <span className="font-medium text-foreground">Kittel & Friedrich</span>,{' '}
        <em>Theological Dictionary of the New Testament</em>
        {entry.volume && <span> (Vol. {entry.volume})</span>}
        {entry.pages && <span>, pp. {entry.pages}</span>}
        {' '}— Abridged by G.W. Bromiley
      </p>
    </div>
  );
}
