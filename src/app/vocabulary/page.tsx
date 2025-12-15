'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, BookOpen, Check, Clock } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { GreekWord } from '@/components/GreekWord';
import { cn } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord } from '@/types';

type FilterStatus = 'all' | 'learned' | 'learning' | 'new';
type FilterTier = 0 | 1 | 2 | 3 | 4 | 5;

export default function VocabularyPage() {
  const { progress } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [tierFilter, setTierFilter] = useState<FilterTier>(0);
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const words = vocabularyData.words as VocabularyWord[];

  const getWordStatus = (wordId: string): 'learned' | 'learning' | 'new' => {
    const wordProgress = progress[wordId];
    if (!wordProgress) return 'new';
    if (wordProgress.repetitions >= 5) return 'learned';
    return 'learning';
  };

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesGreek = word.greek.toLowerCase().includes(searchLower);
        const matchesGloss = word.gloss.toLowerCase().includes(searchLower);
        const matchesTranslit = word.transliteration.toLowerCase().includes(searchLower);
        if (!matchesGreek && !matchesGloss && !matchesTranslit) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        const status = getWordStatus(word.id);
        if (status !== statusFilter) return false;
      }

      // Tier filter
      if (tierFilter !== 0 && word.tier !== tierFilter) {
        return false;
      }

      return true;
    });
  }, [words, search, statusFilter, tierFilter, progress]);

  const stats = useMemo(() => {
    let learned = 0;
    let learning = 0;
    let newWords = 0;

    for (const word of words) {
      const status = getWordStatus(word.id);
      if (status === 'learned') learned++;
      else if (status === 'learning') learning++;
      else newWords++;
    }

    return { learned, learning, new: newWords, total: words.length };
  }, [words, progress]);

  if (!mounted) {
    return <VocabularySkeleton />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Vocabulary Browser</h1>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words..."
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              )}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterButton
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            >
              All ({stats.total})
            </FilterButton>
            <FilterButton
              active={statusFilter === 'learned'}
              onClick={() => setStatusFilter('learned')}
            >
              <Check className="w-3 h-3 mr-1" />
              Learned ({stats.learned})
            </FilterButton>
            <FilterButton
              active={statusFilter === 'learning'}
              onClick={() => setStatusFilter('learning')}
            >
              <Clock className="w-3 h-3 mr-1" />
              Learning ({stats.learning})
            </FilterButton>
            <FilterButton
              active={statusFilter === 'new'}
              onClick={() => setStatusFilter('new')}
            >
              <BookOpen className="w-3 h-3 mr-1" />
              New ({stats.new})
            </FilterButton>
          </div>

          {/* Tier filter */}
          <div className="flex gap-2 overflow-x-auto">
            <FilterButton
              active={tierFilter === 0}
              onClick={() => setTierFilter(0)}
              size="sm"
            >
              All Tiers
            </FilterButton>
            {[1, 2, 3, 4, 5].map((tier) => (
              <FilterButton
                key={tier}
                active={tierFilter === tier}
                onClick={() => setTierFilter(tier as FilterTier)}
                size="sm"
              >
                Tier {tier}
              </FilterButton>
            ))}
          </div>
        </div>
      </header>

      {/* Word list */}
      <main className="container mx-auto px-4 py-4 max-w-2xl">
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredWords.length} words
        </p>

        <div className="space-y-2">
          {filteredWords.map((word) => {
            const status = getWordStatus(word.id);
            const isExpanded = expandedWord === word.id;

            return (
              <Card
                key={word.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isExpanded && 'ring-2 ring-primary'
                )}
                onClick={() => setExpandedWord(isExpanded ? null : word.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <GreekWord
                        greek={word.greek}
                        transliteration={word.transliteration}
                        size="md"
                        showAudio={isExpanded}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {word.gloss}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={status} />
                      <TierBadge tier={word.tier} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-sm">{word.definition}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{word.partOfSpeech}</span>
                        <span>-</span>
                        <span>Frequency: {word.frequency}</span>
                      </div>
                      {progress[word.id] && (
                        <div className="text-xs text-muted-foreground">
                          Reviews: {progress[word.id].repetitions} |
                          Ease: {progress[word.id].easeFactor.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No words match your filters</p>
          </div>
        )}
      </main>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
  size = 'default',
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  size?: 'default' | 'sm';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center whitespace-nowrap rounded-full border transition-colors',
        size === 'default' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background hover:bg-muted border-border'
      )}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: 'learned' | 'learning' | 'new' }) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-xs font-medium',
        status === 'learned' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
        status === 'learning' && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        status === 'new' && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      )}
    >
      {status === 'learned' && 'Learned'}
      {status === 'learning' && 'Learning'}
      {status === 'new' && 'New'}
    </span>
  );
}

function TierBadge({ tier }: { tier: number }) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-xs font-medium',
        tier === 1 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
        tier === 2 && 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        tier === 3 && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        tier === 4 && 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
        tier === 5 && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      )}
    >
      T{tier}
    </span>
  );
}

function VocabularySkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b p-4 space-y-3">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-10 bg-muted rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded-full" />
          ))}
        </div>
      </header>
      <main className="container mx-auto px-4 py-4 max-w-2xl space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </main>
    </div>
  );
}
