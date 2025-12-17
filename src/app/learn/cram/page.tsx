'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, RotateCcw, Shuffle, Settings2, ChevronRight, Check, XIcon } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { FlashCard } from '@/components/FlashCard';
import { GreekWord } from '@/components/GreekWord';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn, shuffle } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord } from '@/types';

type CramFilter = 'all' | 'learned' | 'learning' | 'new' | 'leeches';

export default function CramPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CramPageContent />
    </Suspense>
  );
}

function CramPageContent() {
  const router = useRouter();

  const { progress, selectedTiers, selectedPOS, selectedCategories, getLeeches, isLeech } = useUserStore();

  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [filter, setFilter] = useState<CramFilter>('all');
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getWordStatus = useCallback((wordId: string): 'learned' | 'learning' | 'new' => {
    const wordProgress = progress[wordId];
    if (!wordProgress) return 'new';
    if ((wordProgress.maxRepetitions || wordProgress.repetitions) >= 5) return 'learned';
    return 'learning';
  }, [progress]);

  // Helper function to match base filters (tier, POS, category)
  const matchesBaseFilters = useCallback((w: VocabularyWord): boolean => {
    if (!selectedTiers.includes(w.tier)) return false;
    if (selectedPOS.length > 0 && !selectedPOS.includes(w.partOfSpeech)) return false;
    if (selectedCategories.length > 0) {
      const wordCategory = w.semanticCategory || 'general';
      if (!selectedCategories.includes(wordCategory)) return false;
    }
    return true;
  }, [selectedTiers, selectedPOS, selectedCategories]);

  const getFilteredWords = useCallback(() => {
    const allWords = vocabularyData.words as VocabularyWord[];

    // Apply base filters (tier, POS, category)
    let filtered = allWords.filter(matchesBaseFilters);

    switch (filter) {
      case 'learned':
        filtered = filtered.filter(w => getWordStatus(w.id) === 'learned');
        break;
      case 'learning':
        filtered = filtered.filter(w => getWordStatus(w.id) === 'learning');
        break;
      case 'new':
        filtered = filtered.filter(w => getWordStatus(w.id) === 'new');
        break;
      case 'leeches':
        filtered = filtered.filter(w => isLeech(w.id));
        break;
    }

    return shuffle([...filtered]);
  }, [matchesBaseFilters, filter, getWordStatus, isLeech]);

  const startCram = () => {
    const cramWords = getFilteredWords();
    if (cramWords.length === 0) return;
    setWords(cramWords);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ correct: 0, incorrect: 0 });
    setSessionComplete(false);
    setStarted(true);
  };

  const handleResponse = (correct: boolean) => {
    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    startCram();
  };

  const handleReshuffle = () => {
    setWords(shuffle([...words]));
    setCurrentIndex(0);
    setIsFlipped(false);
    setStats({ correct: 0, incorrect: 0 });
  };

  const currentWord = words[currentIndex];
  const filteredCount = getFilteredWords().length;
  const leechCount = getLeeches().length;

  if (!mounted) {
    return <LoadingSkeleton />;
  }

  // Setup screen
  if (!started) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Cram Mode</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧠</div>
            <h2 className="text-xl font-bold mb-2">Quick Review</h2>
            <p className="text-muted-foreground text-sm">
              Rapidly review words without affecting SRS progress. Perfect for cramming before a test!
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="py-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Filter Words
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <FilterButton
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                  count={(vocabularyData.words as VocabularyWord[]).filter(matchesBaseFilters).length}
                >
                  All Words
                </FilterButton>
                <FilterButton
                  active={filter === 'learned'}
                  onClick={() => setFilter('learned')}
                  count={(vocabularyData.words as VocabularyWord[]).filter(w =>
                    matchesBaseFilters(w) && getWordStatus(w.id) === 'learned'
                  ).length}
                >
                  Learned
                </FilterButton>
                <FilterButton
                  active={filter === 'learning'}
                  onClick={() => setFilter('learning')}
                  count={(vocabularyData.words as VocabularyWord[]).filter(w =>
                    matchesBaseFilters(w) && getWordStatus(w.id) === 'learning'
                  ).length}
                >
                  Learning
                </FilterButton>
                <FilterButton
                  active={filter === 'new'}
                  onClick={() => setFilter('new')}
                  count={(vocabularyData.words as VocabularyWord[]).filter(w =>
                    matchesBaseFilters(w) && getWordStatus(w.id) === 'new'
                  ).length}
                >
                  New
                </FilterButton>
                {leechCount > 0 && (
                  <FilterButton
                    active={filter === 'leeches'}
                    onClick={() => setFilter('leeches')}
                    count={(vocabularyData.words as VocabularyWord[]).filter(w =>
                      matchesBaseFilters(w) && isLeech(w.id)
                    ).length}
                    className="col-span-2"
                  >
                    ⚠️ Leeches (difficult words)
                  </FilterButton>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full h-14"
            onClick={startCram}
            disabled={filteredCount === 0}
          >
            {filteredCount > 0 ? (
              <>
                Start Cramming ({filteredCount} words)
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              'No words match your filter'
            )}
          </Button>
        </main>
      </div>
    );
  }

  // Session complete screen
  if (sessionComplete) {
    const total = stats.correct + stats.incorrect;
    const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">
              {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
            </div>
            <h2 className="text-2xl font-bold mb-2">Cram Complete!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-lg">
                <span className="font-bold text-emerald-500">{stats.correct}</span>
                <span className="text-muted-foreground"> correct / </span>
                <span className="font-bold text-red-500">{stats.incorrect}</span>
                <span className="text-muted-foreground"> incorrect</span>
              </p>
              <p className="text-3xl font-bold text-purple-500">{accuracy}%</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              (SRS progress was not affected)
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Again
              </Button>
              <Button onClick={() => router.push('/')} className="flex-1">
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active cram session
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="icon" onClick={handleReshuffle} aria-label="Shuffle cards">
              <Shuffle className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium">
              {currentIndex + 1} / {words.length}
            </span>
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} aria-label="Exit">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Stats bar */}
        <div className="flex gap-4 mb-4 text-sm">
          <span className="text-emerald-500 font-medium">✓ {stats.correct}</span>
          <span className="text-red-500 font-medium">✗ {stats.incorrect}</span>
        </div>

        {/* Flashcard */}
        {currentWord && (
          <FlashCard
            word={currentWord}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            className="mb-6"
          />
        )}

        {/* Response buttons (show when flipped) */}
        {isFlipped ? (
          <div className="flex gap-4 w-full max-w-md">
            <Button
              variant="outline"
              className="flex-1 h-14 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
              onClick={() => handleResponse(false)}
            >
              <XIcon className="w-5 h-5 mr-2" />
              Incorrect
            </Button>
            <Button
              className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600"
              onClick={() => handleResponse(true)}
            >
              <Check className="w-5 h-5 mr-2" />
              Correct
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Think of the answer, then tap to reveal
          </p>
        )}
      </main>

      {/* Footer stats */}
      <footer className="border-t bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3 text-center text-xs text-muted-foreground">
          Cram Mode • SRS progress not affected
        </div>
      </footer>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
  count,
  className,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border text-left transition-all',
        active
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/50',
        className
      )}
    >
      <div className="font-medium text-sm">{children}</div>
      <div className="text-xs text-muted-foreground">{count} words</div>
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b p-4">
        <div className="h-8 bg-muted rounded w-32" />
      </header>
      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-14 bg-muted rounded-lg" />
      </main>
    </div>
  );
}
