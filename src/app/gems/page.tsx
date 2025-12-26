'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Gem, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GemCard, GemCardSkeleton, GemLevelTabs, GemCategoryFilter } from '@/components/gems';
import { storage } from '@/lib/utils';
import gemsData from '@/data/greek-gems.json';
import type { GreekGem, GemCategory, GemLevel } from '@/types';
import { GEM_LEVELS } from '@/types';

// Type assertion for imported JSON
const gems = gemsData.gems as GreekGem[];

export default function GemsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeLevel, setActiveLevel] = useState<GemLevel | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<GemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewedGems, setViewedGems] = useState<string[]>([]);

  // Load viewed gems from storage on mount
  useEffect(() => {
    setMounted(true);
    const stored = storage.get<string[]>('gems-viewed', []);
    setViewedGems(stored);
  }, []);

  // Calculate unlocked levels based on gems viewed
  const unlockedLevels = useMemo((): GemLevel[] => {
    const count = viewedGems.length;
    const levels: GemLevel[] = ['beginner'];

    if (count >= GEM_LEVELS.intermediate.minGems) levels.push('intermediate');
    if (count >= GEM_LEVELS.advanced.minGems) levels.push('advanced');
    if (count >= GEM_LEVELS.expert.minGems) levels.push('expert');

    return levels;
  }, [viewedGems]);

  // Calculate counts per level and category
  const gemCounts = useMemo(() => {
    const levelCounts: Record<GemLevel, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      expert: 0,
    };
    const categoryCounts: Record<GemCategory, number> = {
      wordplay: 0,
      tense: 0,
      untranslatable: 0,
      chiasm: 0,
      emphatic: 0,
      article: 0,
      discourse: 0,
      double_meaning: 0,
    };

    gems.forEach((gem) => {
      levelCounts[gem.level]++;
      categoryCounts[gem.category]++;
    });

    return { levelCounts, categoryCounts };
  }, []);

  // Filter gems based on active filters and search
  const filteredGems = useMemo(() => {
    return gems.filter((gem) => {
      // Level filter
      if (activeLevel !== 'all' && gem.level !== activeLevel) {
        return false;
      }

      // Category filter
      if (activeCategory !== 'all' && gem.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          gem.title,
          gem.greek,
          gem.transliteration,
          gem.reference,
          gem.insight,
          ...gem.tags,
        ].join(' ').toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Only show gems from unlocked levels
      if (!unlockedLevels.includes(gem.level)) {
        return false;
      }

      return true;
    });
  }, [activeLevel, activeCategory, searchQuery, unlockedLevels]);

  // Sort gems: unviewed first, then by level order
  const sortedGems = useMemo(() => {
    const levelOrder: Record<GemLevel, number> = {
      beginner: 0,
      intermediate: 1,
      advanced: 2,
      expert: 3,
    };

    return [...filteredGems].sort((a, b) => {
      const aViewed = viewedGems.includes(a.id);
      const bViewed = viewedGems.includes(b.id);

      // Unviewed gems first
      if (aViewed !== bViewed) {
        return aViewed ? 1 : -1;
      }

      // Then by level
      return levelOrder[a.level] - levelOrder[b.level];
    });
  }, [filteredGems, viewedGems]);

  if (!mounted) {
    return <GemsPageSkeleton />;
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
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Gem className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Greek Gems</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Discover what English translations miss
                  </p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <div>
                <p className="font-medium text-sm">
                  {viewedGems.length} of {gems.length} gems discovered
                </p>
                <p className="text-xs text-muted-foreground">
                  {unlockedLevels.length < 4
                    ? `View ${GEM_LEVELS[Object.keys(GEM_LEVELS)[unlockedLevels.length] as GemLevel]?.minGems - viewedGems.length} more to unlock the next level`
                    : 'All levels unlocked!'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-violet-500">
                {Math.round((viewedGems.length / gems.length) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Level Tabs */}
        <section className="mb-4">
          <GemLevelTabs
            activeLevel={activeLevel}
            onLevelChange={setActiveLevel}
            gemCounts={gemCounts.levelCounts}
            unlockedLevels={unlockedLevels}
            totalGems={gems.filter(g => unlockedLevels.includes(g.level)).length}
          />
        </section>

        {/* Category Filter */}
        <section className="mb-4">
          <GemCategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categoryCounts={gemCounts.categoryCounts}
          />
        </section>

        {/* Search */}
        <section className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search gems by title, Greek, reference, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </section>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {sortedGems.length} gem{sortedGems.length !== 1 ? 's' : ''}
          {activeLevel !== 'all' && ` in ${activeLevel}`}
          {activeCategory !== 'all' && ` (${activeCategory.replace('_', ' ')})`}
        </p>

        {/* Gems Grid */}
        {sortedGems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {sortedGems.map((gem) => (
              <GemCard key={gem.id} gem={gem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gem className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No gems match your filters</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setActiveLevel('all');
                setActiveCategory('all');
                setSearchQuery('');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

// Loading skeleton
function GemsPageSkeleton() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-5 bg-muted rounded animate-pulse" />
              <div className="w-48 h-3 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Progress skeleton */}
        <div className="mb-6 p-4 rounded-xl bg-muted/50 animate-pulse h-20" />

        {/* Tabs skeleton */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-24 h-10 bg-muted rounded-full animate-pulse" />
          ))}
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-2 mb-6 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-28 h-8 bg-muted rounded-full animate-pulse" />
          ))}
        </div>

        {/* Search skeleton */}
        <div className="w-full h-11 bg-muted rounded-lg animate-pulse mb-6" />

        {/* Cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GemCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
