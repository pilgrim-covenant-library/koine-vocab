'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Share2, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StoryBadge, StoryDisplay } from '@/components/stories';
import { storage } from '@/lib/utils';
import storiesData from '@/data/greek-learning-stories.json';
import type { GreekLearningStory } from '@/types';

// Type assertion for imported JSON
const stories = storiesData.stories as GreekLearningStory[];

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const storyId = params.id as string;
  const story = stories.find((s) => s.id === storyId);

  // Find adjacent stories for navigation
  const currentIndex = stories.findIndex((s) => s.id === storyId);
  const prevStory = currentIndex > 0 ? stories[currentIndex - 1] : null;
  const nextStory = currentIndex < stories.length - 1 ? stories[currentIndex + 1] : null;

  // Mark story as viewed
  useEffect(() => {
    setMounted(true);

    if (story) {
      const viewed = storage.get<string[]>('stories-viewed', []);
      if (!viewed.includes(story.id)) {
        const updated = [...viewed, story.id];
        storage.set('stories-viewed', updated);
      }
    }
  }, [story]);

  // Handle share
  const handleShare = async () => {
    if (!story) return;

    const shareData = {
      title: `Greek Learning Story: ${story.figure}`,
      text: `Discover how ${story.figure} learned Greek: ${story.summary}`,
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
    return <StoryDetailSkeleton />;
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Story not found</p>
          <Link href="/stories">
            <Button>Back to Stories</Button>
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
              <Link href="/stories">
                <Button variant="ghost" size="icon" aria-label="Back to stories">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Back to stories
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                aria-label="Share story"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Era Badge */}
        <div className="mb-4">
          <StoryBadge era={story.era} size="md" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          {story.title}
        </h1>

        {/* Figure Info */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium text-foreground">{story.figure}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{story.years}</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {story.summary}
        </p>

        {/* Story Content */}
        <StoryDisplay
          story={story.story}
          greekMethod={story.greekMethod}
          keyLesson={story.keyLesson}
          quote={story.quote}
          source={story.source}
        />

        {/* Tags */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {story.tags.map((tag) => (
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
          {prevStory ? (
            <Link
              href={`/stories/${prevStory.id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{prevStory.figure}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          ) : (
            <div />
          )}

          {nextStory ? (
            <Link
              href={`/stories/${nextStory.id}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="hidden sm:inline">{nextStory.figure}</span>
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
function StoryDetailSkeleton() {
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
        {/* Badge */}
        <div className="w-28 h-6 bg-muted rounded-full mb-4" />

        {/* Title */}
        <div className="w-3/4 h-8 bg-muted rounded mb-4" />

        {/* Figure info */}
        <div className="flex gap-4 mb-6">
          <div className="w-32 h-5 bg-muted rounded" />
          <div className="w-24 h-5 bg-muted rounded" />
        </div>

        {/* Summary */}
        <div className="space-y-2 mb-8">
          <div className="w-full h-5 bg-muted rounded" />
          <div className="w-5/6 h-5 bg-muted rounded" />
        </div>

        {/* Content cards */}
        <div className="space-y-6">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </main>
    </div>
  );
}
