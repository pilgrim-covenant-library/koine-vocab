'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Brain, Keyboard, Trophy, Settings, ChevronRight, Languages, TrendingUp, BookType, ClipboardList, Gem, BookHeart, BookCopy, Library, Crown } from 'lucide-react';
import { useUserStats, useUserProgress, useUserActions } from '@/stores/userStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { XPBar } from '@/components/XPBar';
import { StreakFire } from '@/components/StreakFire';
import { ProgressRing } from '@/components/ProgressRing';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';

// =============================================================================
// PRE-COMPUTED TIER DATA - Computed once at module load, not on every render
// =============================================================================
// This eliminates filtering 1,700 words × 5 tiers on every dashboard render

const TIER_WORD_IDS: Record<number, Set<string>> = {};
const TIER_TOTALS: Record<number, number> = {};

// Pre-compute tier word Sets once when module loads
[1, 2, 3, 4, 5].forEach(tier => {
  const tierWords = vocabularyData.words.filter(w => w.tier === tier);
  TIER_WORD_IDS[tier] = new Set(tierWords.map(w => w.id));
  TIER_TOTALS[tier] = tierWords.length;
});

// Static tier metadata - defined once outside component
const TIER_COLORS: Record<number, string> = {
  1: 'bg-emerald-500',
  2: 'bg-blue-500',
  3: 'bg-amber-500',
  4: 'bg-orange-500',
  5: 'bg-red-500',
};

const TIER_LABELS: Record<number, string> = {
  1: 'Essential',
  2: 'High Freq',
  3: 'Medium',
  4: 'Lower',
  5: 'Advanced',
};

export default function Dashboard() {
  // Use granular selectors to minimize re-renders
  const stats = useUserStats();
  const progress = useUserProgress();
  const { getDueWords, getLearnedWordsCount, getCommonVocabProgress } = useUserActions();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize expensive calculations
  const dueCount = useMemo(() => getDueWords().length, [getDueWords]);
  const learnedCount = useMemo(() => getLearnedWordsCount(), [getLearnedWordsCount]);
  const totalWords = vocabularyData.words.length;
  const commonVocabProgress = useMemo(() => getCommonVocabProgress(), [getCommonVocabProgress]);

  // Memoized tier progress calculation using pre-computed tier word Sets
  // This avoids filtering 1,700 words × 5 tiers on every render
  const getTierProgress = useCallback((tier: number) => {
    const tierWordIds = TIER_WORD_IDS[tier];
    const learnedInTier = Object.values(progress).filter(
      (p) => tierWordIds.has(p.wordId) && (p.maxRepetitions || p.repetitions) >= 5
    ).length;
    return { learned: learnedInTier, total: TIER_TOTALS[tier] };
  }, [progress]);

  if (!mounted) {
    return <DashboardSkeleton />;
  }

  return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary">Koine Greek</h1>
          </div>
          <div className="flex items-center gap-2">
            <StreakFire streak={stats.streak} />
            <ThemeToggle />
            <Link href="/progress">
              <Button variant="ghost" size="icon" aria-label="View progress analytics">
                <TrendingUp className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-6 max-w-2xl">
        {/* XP and Level */}
        <section className="mb-8">
          <XPBar xp={stats.xp} level={stats.level} />
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-primary">{learnedCount}</div>
            <div className="text-sm text-muted-foreground">Words Learned</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-orange-500">{dueCount}</div>
            <div className="text-sm text-muted-foreground">Due Today</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-purple-500">
              {Math.round((stats.correctReviews / Math.max(1, stats.totalReviews)) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </Card>
        </section>

        {/* Start Review CTA */}
        {dueCount > 0 && (
          <section className="mb-8">
            <Link href="/learn/flashcards">
              <Button size="lg" className="w-full h-16 text-lg">
                <BookOpen className="w-6 h-6 mr-2" />
                Start Review ({dueCount} cards)
              </Button>
            </Link>
          </section>
        )}

        {/* Learn New Words CTA */}
        {dueCount === 0 && (
          <section className="mb-8">
            <Link href="/learn">
              <Button size="lg" className="w-full h-16 text-lg">
                <Brain className="w-6 h-6 mr-2" />
                Learn New Words
              </Button>
            </Link>
          </section>
        )}

        {/* Learning Modes */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Learning Modes</h2>
          <div className="grid grid-cols-1 gap-3">
            <LearningModeCard
              href="/learn/flashcards"
              icon={<BookOpen className="w-6 h-6" />}
              title="Flashcards"
              description="Classic spaced repetition with flip cards"
              color="bg-emerald-500"
            />
            <LearningModeCard
              href="/learn/quiz"
              icon={<Brain className="w-6 h-6" />}
              title="Quiz Mode"
              description="Multiple choice questions"
              color="bg-blue-500"
            />
            <LearningModeCard
              href="/learn/typing"
              icon={<Keyboard className="w-6 h-6" />}
              title="Type Practice"
              description="Type the translation"
              color="bg-purple-500"
            />
            <LearningModeCard
              href="/learn/translation"
              icon={<Languages className="w-6 h-6" />}
              title="Passage Translation"
              description="Translate verses from the Greek NT"
              color="bg-amber-500"
            />
            <LearningModeCard
              href="/grammar"
              icon={<BookType className="w-6 h-6" />}
              title="Grammar"
              description="Parse words, study paradigms, practice forms"
              color="bg-rose-500"
            />
            <LearningModeCard
              href="/homework"
              icon={<ClipboardList className="w-6 h-6" />}
              title="Homework"
              description="Complete assignments to test your knowledge"
              color="bg-cyan-500"
            />
            <LearningModeCard
              href="/gems"
              icon={<Gem className="w-6 h-6" />}
              title="Greek Gems"
              description="Discover insights lost in English translation"
              color="bg-violet-500"
            />
            <LearningModeCard
              href="/synonyms"
              icon={<BookCopy className="w-6 h-6" />}
              title="Synonyms"
              description="Vine's Dictionary word distinctions"
              color="bg-indigo-500"
            />
            <LearningModeCard
              href="/kittel"
              icon={<Library className="w-6 h-6" />}
              title="Kittel's Dictionary"
              description="TDNT theological word studies"
              color="bg-amber-600"
            />
            <LearningModeCard
              href="/stories"
              icon={<BookHeart className="w-6 h-6" />}
              title="Inspirational Stories"
              description="How the Reformers mastered Greek"
              color="bg-rose-500"
            />
          </div>
        </section>

        {/* Common NT Vocab Challenge */}
        <section className="mb-8">
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
                  <Crown className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Common NT Vocab</h3>
                  <p className="text-sm text-muted-foreground">
                    Master the 100 most frequent words
                  </p>
                </div>
                <ProgressRing progress={commonVocabProgress.percentage} size={60} strokeWidth={5}>
                  <span className="text-sm font-bold">{commonVocabProgress.learned}</span>
                </ProgressRing>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
                    style={{ width: `${commonVocabProgress.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{commonVocabProgress.learned} / {commonVocabProgress.total} mastered</span>
                  <span>{commonVocabProgress.percentage}% complete</span>
                </div>
              </div>
              <Link href="/learn/common-vocab" className="block mt-4">
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                  {commonVocabProgress.learned === 0 ? 'Start Challenge' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Vocabulary Progress */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Vocabulary Progress</span>
                <Link href="/vocabulary">
                  <Button variant="ghost" size="sm">
                    Browse <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((tier) => {
                  const { learned, total } = getTierProgress(tier);
                  const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;
                  return (
                    <TierProgressBar
                      key={tier}
                      tier={tier}
                      learned={learned}
                      total={total}
                      progress={percentage}
                    />
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {learnedCount} / {totalWords} total words
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Achievements Preview */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Achievements
                </span>
                <Link href="/achievements">
                  <Button variant="ghost" size="sm">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.achievements.length} achievements unlocked
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

// Learning mode card component
function LearningModeCard({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={cn('p-3 rounded-xl text-white', color)}>{icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

// Tier progress bar component - uses pre-defined TIER_COLORS and TIER_LABELS
function TierProgressBar({
  tier,
  learned,
  total,
  progress,
}: {
  tier: number;
  learned: number;
  total: number;
  progress: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>
          Tier {tier}: {TIER_LABELS[tier]}
        </span>
        <span className="text-muted-foreground">
          {learned}/{total}
        </span>
      </div>
      <div className="h-2 bg-muted/50 dark:bg-muted/30 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', TIER_COLORS[tier])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-muted rounded-lg" />
            <div className="h-10 w-10 bg-muted rounded-lg" />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div className="h-8 bg-muted rounded-full" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-16 bg-muted rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
