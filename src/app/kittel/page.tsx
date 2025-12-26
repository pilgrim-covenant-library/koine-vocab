'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Library, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { KittelCard, KittelCardSkeleton, KittelCategoryTabs } from '@/components/kittel';
import { storage } from '@/lib/utils';
import kittelData from '@/data/kittel-dictionary.json';
import type { KittelEntry, KittelCategory } from '@/types';

// Type assertion for imported JSON
const entries = kittelData.entries as KittelEntry[];

export default function KittelPage() {
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<KittelCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewedEntries, setViewedEntries] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const viewed = storage.get<string[]>('kittel-viewed', []);
    setViewedEntries(viewed);
  }, []);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter((e) => e.category === activeCategory);
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((e) => {
        const searchableText = [
          e.title,
          e.greek,
          e.transliteration,
          e.shortDef,
          e.summary,
          e.category,
          ...e.tags,
        ].join(' ').toLowerCase();
        return searchableText.includes(searchLower);
      });
    }

    // Sort: unviewed first, then alphabetically by Greek
    result.sort((a, b) => {
      const aViewed = viewedEntries.includes(a.id);
      const bViewed = viewedEntries.includes(b.id);
      if (aViewed !== bViewed) return aViewed ? 1 : -1;
      return a.greek.localeCompare(b.greek);
    });

    return result;
  }, [activeCategory, search, viewedEntries]);

  // Count entries by category
  const categoryCounts = useMemo(() => {
    const counts: Record<KittelCategory | 'all', number> = {
      all: entries.length,
      salvation: 0,
      christology: 0,
      pneumatology: 0,
      ecclesiology: 0,
      eschatology: 0,
      anthropology: 0,
      hamartiology: 0,
      ethics: 0,
      worship: 0,
      revelation: 0,
      covenant: 0,
      faith: 0,
      other: 0,
    };
    entries.forEach((e) => {
      counts[e.category]++;
    });
    return counts;
  }, []);

  if (!mounted) {
    return <KittelPageSkeleton />;
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
                <Library className="w-5 h-5 text-amber-500" />
                <h1 className="text-lg font-semibold">Kittel's Dictionary</h1>
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
            Explore the theological depth of key NT Greek words. Based on Kittel's Theological Dictionary of the New Testament,
            tracing each word from classical Greek through the LXX into the New Testament.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {viewedEntries.length} of {entries.length} word studies completed
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Greek word, topic, or category..."
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
          <KittelCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Entries Grid */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No entries found matching your criteria.</p>
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
            {filteredEntries.map((entry) => (
              <KittelCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Loading skeleton
function KittelPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="w-44 h-6 bg-muted rounded" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="w-3/4 h-5 bg-muted rounded mb-2" />
        <div className="w-1/2 h-5 bg-muted rounded mb-6" />

        <div className="w-full h-10 bg-muted rounded-lg mb-4" />

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-24 h-8 bg-muted rounded-full shrink-0" />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <KittelCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
