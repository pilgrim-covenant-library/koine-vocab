'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookCopy, Search, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SynonymCard, SynonymCardSkeleton, SynonymCategoryTabs } from '@/components/synonyms';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';
import { storage } from '@/lib/utils';
import synonymsData from '@/data/vine-synonyms.json';
import type { SynonymGroup, SynonymCategory } from '@/types';

// Type assertion for imported JSON with defensive check
const synonymGroups: SynonymGroup[] = Array.isArray(synonymsData?.synonymGroups)
  ? (synonymsData.synonymGroups as SynonymGroup[])
  : [];

export default function SynonymsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SynonymCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewedGroups, setViewedGroups] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const viewed = storage.get<string[]>('synonyms-viewed', []);
      // Defensive: ensure viewed is an array
      setViewedGroups(Array.isArray(viewed) ? viewed : []);
    } catch (error) {
      console.error('Failed to load viewed synonyms:', error);
      setViewedGroups([]);
    }
  }, []);

  // Valid categories from the type system
  const validCategories: (SynonymCategory | 'all')[] = [
    'all', 'love', 'know', 'see', 'ask', 'pray', 'sin', 'power',
    'new', 'time', 'life', 'word', 'temple', 'world', 'another', 'servant', 'other'
  ];

  // Helper to normalize category - unknown categories map to 'other'
  const normalizeCategory = (cat: string): SynonymCategory => {
    if (validCategories.includes(cat as SynonymCategory)) {
      return cat as SynonymCategory;
    }
    return 'other';
  };

  // Filter and sort synonym groups
  const filteredGroups = useMemo(() => {
    let result = synonymGroups;

    // Filter by category (using normalized categories)
    if (activeCategory !== 'all') {
      result = result.filter((g) => normalizeCategory(g.category) === activeCategory);
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((g) => {
        const searchableText = [
          g.title,
          g.englishWord,
          g.introduction,
          g.category,
          ...g.words.map((w) => w.greek),
          ...g.words.map((w) => w.transliteration),
          ...g.tags,
        ].join(' ').toLowerCase();
        return searchableText.includes(searchLower);
      });
    }

    // Sort: unviewed first, then alphabetically by title
    result.sort((a, b) => {
      const aViewed = viewedGroups.includes(a.id);
      const bViewed = viewedGroups.includes(b.id);
      if (aViewed !== bViewed) return aViewed ? 1 : -1;
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [activeCategory, search, viewedGroups]);

  // Count groups by category
  const categoryCounts = useMemo(() => {
    const counts: Record<SynonymCategory | 'all', number> = {
      all: synonymGroups.length,
      love: 0,
      know: 0,
      see: 0,
      ask: 0,
      pray: 0,
      sin: 0,
      power: 0,
      new: 0,
      time: 0,
      life: 0,
      word: 0,
      temple: 0,
      world: 0,
      another: 0,
      servant: 0,
      other: 0,
    };
    synonymGroups.forEach((g) => {
      const normalizedCat = normalizeCategory(g.category);
      counts[normalizedCat]++;
    });
    return counts;
  }, []);

  if (!mounted) {
    return <SynonymsPageSkeleton />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" aria-label="Back to home">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <BookCopy className="w-5 h-5 text-indigo-500" />
                <h1 className="text-lg font-semibold">Greek Synonyms</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Intro */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Discover the subtle distinctions between Greek words that English translates the same way.
            Based on Vine's Expository Dictionary of New Testament Words.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {viewedGroups.length} of {synonymGroups.length} word groups studied
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by English word, Greek, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <SynonymCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Synonym Groups Grid - wrapped in error boundary */}
        <SectionErrorBoundary sectionName="Synonym Groups">
          {synonymGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Synonym data is currently unavailable.</p>
              <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No synonym groups found matching your criteria.</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setActiveCategory('all');
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredGroups.map((group, index) => (
                <SynonymCard key={group?.id || `group-${index}`} group={group} />
              ))}
            </div>
          )}
        </SectionErrorBoundary>
      </main>
    </div>
  );
}

// Loading skeleton
function SynonymsPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="w-40 h-6 bg-muted rounded" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="w-3/4 h-5 bg-muted rounded mb-2" />
        <div className="w-1/2 h-5 bg-muted rounded mb-6" />

        <div className="w-full h-10 bg-muted rounded-lg mb-4" />

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-20 h-8 bg-muted rounded-full shrink-0" />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <SynonymCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
