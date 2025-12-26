'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookHeart, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StoryCard, StoryCardSkeleton, StoryEraTabs } from '@/components/stories';
import { storage } from '@/lib/utils';
import storiesData from '@/data/greek-learning-stories.json';
import type { GreekLearningStory, StoryEra } from '@/types';

// Type assertion for imported JSON
const stories = storiesData.stories as GreekLearningStory[];

export default function StoriesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeEra, setActiveEra] = useState<StoryEra | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewedStories, setViewedStories] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const viewed = storage.get<string[]>('stories-viewed', []);
    setViewedStories(viewed);
  }, []);

  // Filter and sort stories
  const filteredStories = useMemo(() => {
    let result = stories;

    // Filter by era
    if (activeEra !== 'all') {
      result = result.filter((s) => s.era === activeEra);
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((s) => {
        const searchableText = [
          s.title,
          s.figure,
          s.summary,
          s.era,
          ...s.tags,
        ].join(' ').toLowerCase();
        return searchableText.includes(searchLower);
      });
    }

    // Sort: unviewed first, then by era order
    const eraOrder: Record<StoryEra, number> = {
      reformation: 1,
      puritan: 2,
      eighteenth: 3,
      nineteenth: 4,
      modern: 5,
    };

    result.sort((a, b) => {
      const aViewed = viewedStories.includes(a.id);
      const bViewed = viewedStories.includes(b.id);
      if (aViewed !== bViewed) return aViewed ? 1 : -1;
      return eraOrder[a.era] - eraOrder[b.era];
    });

    return result;
  }, [activeEra, search, viewedStories]);

  // Count stories by era
  const storyCounts = useMemo(() => {
    const counts: Record<StoryEra | 'all', number> = {
      all: stories.length,
      reformation: 0,
      puritan: 0,
      eighteenth: 0,
      nineteenth: 0,
      modern: 0,
    };
    stories.forEach((s) => {
      counts[s.era]++;
    });
    return counts;
  }, []);

  if (!mounted) {
    return <StoriesPageSkeleton />;
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
                <BookHeart className="w-5 h-5 text-rose-500" />
                <h1 className="text-lg font-semibold">Greek Learning Stories</h1>
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
            Be inspired by how the great ministers of the past learned Greek. From Erasmus to John Piper,
            these stories show that with dedication and the right approach, anyone can master the biblical languages.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {viewedStories.length} of {stories.length} stories read
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, era, or tag..."
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

        {/* Era Tabs */}
        <div className="mb-6">
          <StoryEraTabs
            activeEra={activeEra}
            onEraChange={setActiveEra}
            storyCounts={storyCounts}
          />
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stories found matching your criteria.</p>
            <Button
              variant="ghost"
              onClick={() => {
                setSearch('');
                setActiveEra('all');
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Loading skeleton
function StoriesPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="w-48 h-6 bg-muted rounded" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="w-3/4 h-5 bg-muted rounded mb-2" />
        <div className="w-1/2 h-5 bg-muted rounded mb-6" />

        <div className="w-full h-10 bg-muted rounded-lg mb-4" />

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-24 h-8 bg-muted rounded-full" />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <StoryCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
