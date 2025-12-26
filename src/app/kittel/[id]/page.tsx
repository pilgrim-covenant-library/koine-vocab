'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Share2, BookText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { KittelBadge, KittelDisplay } from '@/components/kittel';
import { storage } from '@/lib/utils';
import kittelData from '@/data/kittel-dictionary.json';
import type { KittelEntry } from '@/types';

// Type assertion for imported JSON
const entries = kittelData.entries as KittelEntry[];

export default function KittelDetailPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  const entryId = params.id as string;
  const entry = entries.find((e) => e.id === entryId);

  // Find adjacent entries for navigation
  const currentIndex = entries.findIndex((e) => e.id === entryId);
  const prevEntry = currentIndex > 0 ? entries[currentIndex - 1] : null;
  const nextEntry = currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null;

  // Mark entry as viewed
  useEffect(() => {
    setMounted(true);

    if (entry) {
      const viewed = storage.get<string[]>('kittel-viewed', []);
      if (!viewed.includes(entry.id)) {
        const updated = [...viewed, entry.id];
        storage.set('kittel-viewed', updated);
      }
    }
  }, [entry]);

  // Handle share
  const handleShare = async () => {
    if (!entry) return;

    const shareData = {
      title: `Kittel: ${entry.greek} (${entry.transliteration})`,
      text: `Theological study of ${entry.greek} - ${entry.shortDef}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (!mounted) {
    return <KittelDetailSkeleton />;
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Entry not found</p>
          <Link href="/kittel">
            <Button>Back to Dictionary</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/kittel">
                <Button variant="ghost" size="icon" aria-label="Back to dictionary">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Back to dictionary
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Category Badge */}
        <div className="mb-4">
          <KittelBadge category={entry.category} size="md" />
        </div>

        {/* Greek Word */}
        <div className="mb-4">
          <h1 className="font-greek text-4xl text-foreground">{entry.greek}</h1>
          <p className="text-lg text-muted-foreground">{entry.transliteration}</p>
          <p className="text-sm text-muted-foreground font-mono mt-1">{entry.strongs}</p>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
          {entry.title}
        </h2>

        {/* Short Definition */}
        <div className="flex items-center gap-2 mb-6">
          <BookText className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">{entry.shortDef}</span>
        </div>

        {/* Full Display */}
        <KittelDisplay entry={entry} />

        {/* Tags */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>

        {/* Navigation */}
        <nav className="mt-12 pt-6 border-t flex items-center justify-between">
          {prevEntry ? (
            <Link
              href={`/kittel/${prevEntry.id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline font-greek">{prevEntry.greek}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          ) : (
            <div />
          )}

          {nextEntry ? (
            <Link
              href={`/kittel/${nextEntry.id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="hidden sm:inline font-greek">{nextEntry.greek}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </main>
    </div>
  );
}

// Loading skeleton
function KittelDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="w-32 h-4 bg-muted rounded" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Badge */}
        <div className="w-28 h-6 bg-muted rounded-full mb-4" />

        {/* Greek word */}
        <div className="mb-4">
          <div className="w-32 h-10 bg-muted rounded mb-2" />
          <div className="w-24 h-5 bg-muted rounded mb-1" />
          <div className="w-16 h-4 bg-muted rounded" />
        </div>

        {/* Title */}
        <div className="w-3/4 h-7 bg-muted rounded mb-4" />

        {/* Definition */}
        <div className="w-full h-5 bg-muted rounded mb-6" />

        {/* Content cards */}
        <div className="space-y-6">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-36 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </main>
    </div>
  );
}
