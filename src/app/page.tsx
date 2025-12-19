'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Brain, Keyboard, Trophy, Settings, ChevronRight, Languages, TrendingUp, BookType, ClipboardList } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { XPBar } from '@/components/XPBar';
import { StreakFire } from '@/components/StreakFire';
import { ProgressRing } from '@/components/ProgressRing';
import { Onboarding } from '@/components/Onboarding';
import { DailyQuests } from '@/components/DailyQuests';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';

export default function Dashboard() {
  const { stats, getDueWords, getLearnedWordsCount, dailyGoal, todayReviews, progress } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is new and hasn't seen onboarding
    const hasSeenOnboarding = localStorage.getItem('koine-onboarding-complete');
    const isNewUser = Object.keys(progress).length === 0 && stats.totalReviews === 0;
    if (isNewUser && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [progress, stats.totalReviews]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('koine-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  if (!mounted) {
    return <DashboardSkeleton />;
  }

  const dueCount = getDueWords().length;
  const learnedCount = getLearnedWordsCount();
  const totalWords = vocabularyData.words.length;
  const dailyProgress = Math.min(100, Math.round((todayReviews / dailyGoal) * 100));

  // Calculate per-tier progress (words with 5+ max repetitions are "learned")
  const getTierProgress = (tier: number) => {
    const tierWords = vocabularyData.words.filter((w) => w.tier === tier);
    const tierWordIds = new Set(tierWords.map((w) => w.id));
    const learnedInTier = Object.values(progress).filter(
      (p) => tierWordIds.has(p.wordId) && (p.maxRepetitions || p.repetitions) >= 5
    ).length;
    return { learned: learnedInTier, total: tierWords.length };
  };

  return (
    <>
      {/* Onboarding for new users */}
      {showOnboarding && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}

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

        {/* Daily Goal Progress */}
        <section className="mb-8">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Daily Goal</h3>
                  <p className="text-sm text-muted-foreground">
                    {todayReviews} / {dailyGoal} reviews
                  </p>
                </div>
                <ProgressRing
                  progress={dailyProgress}
                  size={60}
                  strokeWidth={5}
                  color={dailyProgress >= 100 ? 'stroke-emerald-500' : 'stroke-primary'}
                >
                  <span className="text-sm font-bold">{dailyProgress}%</span>
                </ProgressRing>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Daily Quests */}
        <section className="mb-8">
          <DailyQuests />
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
          </div>
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
    </>
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

// Tier progress bar component
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
  const tierColors = {
    1: 'bg-emerald-500',
    2: 'bg-blue-500',
    3: 'bg-amber-500',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  };

  const tierLabels = {
    1: 'Essential',
    2: 'High Freq',
    3: 'Medium',
    4: 'Lower',
    5: 'Advanced',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>
          Tier {tier}: {tierLabels[tier as keyof typeof tierLabels]}
        </span>
        <span className="text-muted-foreground">
          {learned}/{total}
        </span>
      </div>
      <div className="h-2 bg-muted/50 dark:bg-muted/30 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', tierColors[tier as keyof typeof tierColors])}
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
