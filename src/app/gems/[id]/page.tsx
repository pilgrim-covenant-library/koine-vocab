'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GreekWord } from '@/components/GreekWord';
import { GemBadge, GemInsightDisplay } from '@/components/gems';
import { storage } from '@/lib/utils';
import gemsData from '@/data/greek-gems.json';
import type { GreekGem, GemLevel } from '@/types';
import { GEM_LEVELS } from '@/types';

// Type assertion for imported JSON
const gems = gemsData.gems as GreekGem[];

export default function GemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const gemId = params.id as string;
  const gem = gems.find((g) => g.id === gemId);

  // Find adjacent gems for navigation
  const currentIndex = gems.findIndex((g) => g.id === gemId);
  const prevGem = currentIndex > 0 ? gems[currentIndex - 1] : null;
  const nextGem = currentIndex < gems.length - 1 ? gems[currentIndex + 1] : null;

  // Mark gem as viewed
  useEffect(() => {
    setMounted(true);

    if (gem) {
      const viewed = storage.get<string[]>('gems-viewed', []);
      if (!viewed.includes(gem.id)) {
        const updated = [...viewed, gem.id];
        storage.set('gems-viewed', updated);
      }
    }
  }, [gem]);

  // Handle share
  const handleShare = async () => {
    if (!gem) return;

    const shareData = {
      title: `Greek Gem: ${gem.title}`,
      text: `Discover this Greek insight from ${gem.reference}: ${gem.insight.slice(0, 100)}...`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Could add a toast notification here
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (!mounted) {
    return <GemDetailSkeleton />;
  }

  if (!gem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Gem not found</p>
          <Link href="/gems">
            <Button>Back to Gems</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if this level is unlocked
  const viewedGems = storage.get<string[]>('gems-viewed', []);
  const unlockedLevels: GemLevel[] = ['beginner'];
  if (viewedGems.length >= GEM_LEVELS.intermediate.minGems) unlockedLevels.push('intermediate');
  if (viewedGems.length >= GEM_LEVELS.advanced.minGems) unlockedLevels.push('advanced');
  if (viewedGems.length >= GEM_LEVELS.expert.minGems) unlockedLevels.push('expert');

  const isLevelUnlocked = unlockedLevels.includes(gem.level);

  if (!isLevelUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-muted-foreground mb-2">This gem requires {gem.level} level access</p>
          <p className="text-sm text-muted-foreground mb-4">
            View {GEM_LEVELS[gem.level].minGems - viewedGems.length} more gems to unlock this level
          </p>
          <Link href="/gems">
            <Button>Explore Available Gems</Button>
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
              <Link href="/gems">
                <Button variant="ghost" size="icon" aria-label="Back to gems">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Back to gems
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                aria-label="Share gem"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <GemBadge type="category" value={gem.category} size="md" />
          <GemBadge type="level" value={gem.level} size="md" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
          {gem.title}
        </h1>

        {/* Greek Word Display */}
        <div className="mb-8 p-6 rounded-xl bg-muted/50 border">
          <GreekWord
            greek={gem.greek}
            transliteration={gem.transliteration}
            showTransliteration={true}
            showAudio={true}
            size="xl"
          />
          <p className="text-center text-muted-foreground mt-4">
            {gem.reference}
          </p>
        </div>

        {/* Insights */}
        <GemInsightDisplay
          insight={gem.insight}
          source={gem.source}
          whyEnglishMisses={gem.whyEnglishMisses}
          referenceText={gem.referenceText}
          reference={gem.reference}
        />

        {/* Related Words / Strong's Links */}
        {gem.relatedWords && gem.relatedWords.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Related Words</h2>
            <div className="flex flex-wrap gap-2">
              {gem.relatedWords.map((strongs) => (
                <a
                  key={strongs}
                  href={`https://biblehub.com/greek/${strongs.replace('G', '')}.htm`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <span>{strongs}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {gem.tags.map((tag) => (
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
          {prevGem ? (
            <Link
              href={`/gems/${prevGem.id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{prevGem.title}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          ) : (
            <div />
          )}

          {nextGem ? (
            <Link
              href={`/gems/${nextGem.id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="hidden sm:inline">{nextGem.title}</span>
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
function GemDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="w-24 h-4 bg-muted rounded" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <div className="w-28 h-6 bg-muted rounded-full" />
          <div className="w-20 h-6 bg-muted rounded-full" />
        </div>

        {/* Title */}
        <div className="w-3/4 h-8 bg-muted rounded mb-6" />

        {/* Greek display */}
        <div className="mb-8 p-6 rounded-xl bg-muted/50 border">
          <div className="w-1/2 h-12 bg-muted rounded mx-auto mb-2" />
          <div className="w-1/3 h-4 bg-muted rounded mx-auto mb-4" />
          <div className="w-1/4 h-4 bg-muted rounded mx-auto" />
        </div>

        {/* Insight cards */}
        <div className="space-y-6">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </main>
    </div>
  );
}
