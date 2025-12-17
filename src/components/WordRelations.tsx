'use client';

import { useMemo } from 'react';
import { Link2, BookOpen, GitBranch, TrendingUp } from 'lucide-react';
import { getWordRelations, WordRelations as Relations } from '@/lib/wordRelations';
import { GreekWord } from './GreekWord';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { cn } from '@/lib/utils';
import type { VocabularyWord } from '@/types';

interface WordRelationsProps {
  word: VocabularyWord;
  onWordClick?: (word: VocabularyWord) => void;
  compact?: boolean;
}

export function WordRelations({ word, onWordClick, compact = false }: WordRelationsProps) {
  const relations = useMemo(() => getWordRelations(word), [word]);

  const hasRelations =
    relations.similarMeaning.length > 0 ||
    relations.sameCategory.length > 0 ||
    relations.relatedRoot.length > 0;

  if (!hasRelations) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {relations.similarMeaning.length > 0 && (
          <RelationSection
            title="Similar Meaning"
            icon={<Link2 className="w-4 h-4" />}
            words={relations.similarMeaning.slice(0, 3)}
            onWordClick={onWordClick}
            compact
          />
        )}
        {relations.relatedRoot.length > 0 && (
          <RelationSection
            title="Related Words"
            icon={<GitBranch className="w-4 h-4" />}
            words={relations.relatedRoot.slice(0, 3)}
            onWordClick={onWordClick}
            compact
          />
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Related Words
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {relations.similarMeaning.length > 0 && (
          <RelationSection
            title="Similar Meaning"
            icon={<Link2 className="w-4 h-4 text-blue-500" />}
            words={relations.similarMeaning}
            onWordClick={onWordClick}
            description="Words with similar translations"
          />
        )}

        {relations.relatedRoot.length > 0 && (
          <RelationSection
            title="Related Root"
            icon={<GitBranch className="w-4 h-4 text-purple-500" />}
            words={relations.relatedRoot}
            onWordClick={onWordClick}
            description="Words from similar Greek roots"
          />
        )}

        {relations.sameCategory.length > 0 && (
          <RelationSection
            title="Same Category"
            icon={<BookOpen className="w-4 h-4 text-emerald-500" />}
            words={relations.sameCategory}
            onWordClick={onWordClick}
            description={`Other ${word.partOfSpeech}s at similar difficulty`}
          />
        )}

        {relations.similarFrequency.length > 0 && (
          <RelationSection
            title="Study Companions"
            icon={<TrendingUp className="w-4 h-4 text-amber-500" />}
            words={relations.similarFrequency}
            onWordClick={onWordClick}
            description="Words with similar frequency"
          />
        )}
      </CardContent>
    </Card>
  );
}

interface RelationSectionProps {
  title: string;
  icon: React.ReactNode;
  words: VocabularyWord[];
  onWordClick?: (word: VocabularyWord) => void;
  description?: string;
  compact?: boolean;
}

function RelationSection({
  title,
  icon,
  words,
  onWordClick,
  description,
  compact = false,
}: RelationSectionProps) {
  if (compact) {
    return (
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
          {icon}
          {title}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {words.map((w) => (
            <button
              key={w.id}
              onClick={() => onWordClick?.(w)}
              className="px-2 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
            >
              {w.greek}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {words.map((w) => (
          <button
            key={w.id}
            onClick={() => onWordClick?.(w)}
            className={cn(
              'flex items-center justify-between p-2 rounded-lg border bg-background',
              'hover:border-primary/50 hover:bg-muted/50 transition-colors text-left'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="font-greek text-lg">{w.greek}</span>
              <span className="text-sm text-muted-foreground">{w.transliteration}</span>
            </div>
            <span className="text-sm">{w.gloss}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
