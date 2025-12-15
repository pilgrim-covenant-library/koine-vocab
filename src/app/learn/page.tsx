'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Brain, Keyboard, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';

export default function LearnPage() {
  const router = useRouter();
  const [selectedTiers, setSelectedTiers] = useState<number[]>([1]);

  const toggleTier = (tier: number) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const tierData = [1, 2, 3, 4, 5].map((tier) => ({
    tier,
    count: vocabularyData.words.filter((w) => w.tier === tier).length,
    label: ['Essential', 'High Frequency', 'Medium', 'Lower Frequency', 'Advanced'][tier - 1],
    color: ['emerald', 'blue', 'amber', 'orange', 'red'][tier - 1],
  }));

  const selectedWordCount = vocabularyData.words.filter((w) =>
    selectedTiers.includes(w.tier)
  ).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Choose Learning Mode</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Tier Selection */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Select Vocabulary Tiers
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {tierData.map(({ tier, count, label, color }) => (
              <button
                key={tier}
                onClick={() => toggleTier(tier)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                  selectedTiers.includes(tier)
                    ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-950`
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center',
                      selectedTiers.includes(tier)
                        ? `bg-${color}-500 text-white`
                        : 'bg-muted'
                    )}
                  >
                    {selectedTiers.includes(tier) && <Check className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Tier {tier}: {label}</div>
                    <div className="text-sm text-muted-foreground">{count} words</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {selectedWordCount} words selected
          </p>
        </section>

        {/* Learning Modes */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Choose Mode
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <LearningModeCard
              href="/learn/flashcards"
              icon={<BookOpen className="w-6 h-6" />}
              title="Flashcards"
              description="Classic spaced repetition with flip cards. Rate how well you knew each word."
              color="bg-emerald-500"
              recommended
            />
            <LearningModeCard
              href="/learn/quiz"
              icon={<Brain className="w-6 h-6" />}
              title="Quiz Mode"
              description="Multiple choice questions. Pick the correct translation from 4 options."
              color="bg-blue-500"
            />
            <LearningModeCard
              href="/learn/typing"
              icon={<Keyboard className="w-6 h-6" />}
              title="Type Practice"
              description="Type the English translation. Great for active recall practice."
              color="bg-purple-500"
            />
          </div>
        </section>

        {/* Quick Start */}
        <section>
          <Link href="/learn/flashcards">
            <Button size="lg" className="w-full h-14 text-lg">
              Start Learning
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}

function LearningModeCard({
  href,
  icon,
  title,
  description,
  color,
  recommended,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  recommended?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer relative overflow-hidden">
        {recommended && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            Recommended
          </div>
        )}
        <CardContent className="p-4 flex items-start gap-4">
          <div className={cn('p-3 rounded-xl text-white shrink-0', color)}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
