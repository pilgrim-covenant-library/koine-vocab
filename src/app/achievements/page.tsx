'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Lock, Star, Flame, BookOpen, Target, Zap, Award } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'learning' | 'streak' | 'mastery' | 'special';
  requirement: (stats: ReturnType<typeof useUserStore.getState>['stats']) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  // Learning achievements
  {
    id: 'first_word',
    name: 'First Steps',
    description: 'Learn your first word',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'learning',
    requirement: (stats) => stats.wordsLearned >= 1,
  },
  {
    id: 'ten_words',
    name: 'Getting Started',
    description: 'Learn 10 words',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'learning',
    requirement: (stats) => stats.wordsLearned >= 10,
  },
  {
    id: 'fifty_words',
    name: 'Vocabulary Builder',
    description: 'Learn 50 words',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'learning',
    requirement: (stats) => stats.wordsLearned >= 50,
  },
  {
    id: 'hundred_words',
    name: 'Word Collector',
    description: 'Learn 100 words',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'learning',
    requirement: (stats) => stats.wordsLearned >= 100,
  },
  {
    id: 'two_fifty_words',
    name: 'Lexicon Explorer',
    description: 'Learn 250 words',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'learning',
    requirement: (stats) => stats.wordsLearned >= 250,
  },
  {
    id: 'five_hundred_words',
    name: 'Greek Scholar',
    description: 'Learn 500 words',
    icon: <Award className="w-6 h-6" />,
    category: 'learning',
    requirement: (stats) => stats.wordsLearned >= 500,
  },

  // Streak achievements
  {
    id: 'streak_3',
    name: 'Consistent',
    description: 'Maintain a 3-day streak',
    icon: <Flame className="w-6 h-6" />,
    category: 'streak',
    requirement: (stats) => stats.streak >= 3 || stats.longestStreak >= 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: <Flame className="w-6 h-6" />,
    category: 'streak',
    requirement: (stats) => stats.streak >= 7 || stats.longestStreak >= 7,
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day streak',
    icon: <Flame className="w-6 h-6" />,
    category: 'streak',
    requirement: (stats) => stats.streak >= 14 || stats.longestStreak >= 14,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: <Flame className="w-6 h-6" />,
    category: 'streak',
    requirement: (stats) => stats.streak >= 30 || stats.longestStreak >= 30,
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Maintain a 100-day streak',
    icon: <Star className="w-6 h-6" />,
    category: 'streak',
    requirement: (stats) => stats.streak >= 100 || stats.longestStreak >= 100,
  },

  // Mastery achievements
  {
    id: 'reviews_100',
    name: 'Reviewer',
    description: 'Complete 100 reviews',
    icon: <Target className="w-6 h-6" />,
    category: 'mastery',
    requirement: (stats) => stats.totalReviews >= 100,
  },
  {
    id: 'reviews_500',
    name: 'Dedicated Student',
    description: 'Complete 500 reviews',
    icon: <Target className="w-6 h-6" />,
    category: 'mastery',
    requirement: (stats) => stats.totalReviews >= 500,
  },
  {
    id: 'reviews_1000',
    name: 'Review Master',
    description: 'Complete 1,000 reviews',
    icon: <Target className="w-6 h-6" />,
    category: 'mastery',
    requirement: (stats) => stats.totalReviews >= 1000,
  },
  {
    id: 'accuracy_80',
    name: 'Accurate',
    description: 'Achieve 80% overall accuracy',
    icon: <Zap className="w-6 h-6" />,
    category: 'mastery',
    requirement: (stats) =>
      stats.totalReviews >= 50 && stats.correctReviews / stats.totalReviews >= 0.8,
  },
  {
    id: 'accuracy_90',
    name: 'Precision',
    description: 'Achieve 90% overall accuracy',
    icon: <Zap className="w-6 h-6" />,
    category: 'mastery',
    requirement: (stats) =>
      stats.totalReviews >= 100 && stats.correctReviews / stats.totalReviews >= 0.9,
  },

  // Special achievements
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: <Star className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => stats.level >= 5,
  },
  {
    id: 'level_10',
    name: 'Dedicated Learner',
    description: 'Reach Level 10',
    icon: <Star className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => stats.level >= 10,
  },
  {
    id: 'level_25',
    name: 'Greek Enthusiast',
    description: 'Reach Level 25',
    icon: <Trophy className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => stats.level >= 25,
  },
  {
    id: 'level_50',
    name: 'Koine Master',
    description: 'Reach Level 50',
    icon: <Trophy className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => stats.level >= 50,
  },
  {
    id: 'xp_10000',
    name: 'XP Hunter',
    description: 'Earn 10,000 XP',
    icon: <Zap className="w-6 h-6" />,
    category: 'special',
    requirement: (stats) => stats.xp >= 10000,
  },
];

const CATEGORY_LABELS = {
  learning: 'Learning',
  streak: 'Streaks',
  mastery: 'Mastery',
  special: 'Special',
};

const CATEGORY_COLORS = {
  learning: 'text-emerald-500',
  streak: 'text-orange-500',
  mastery: 'text-blue-500',
  special: 'text-purple-500',
};

export default function AchievementsPage() {
  const { stats } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <AchievementsSkeleton />;
  }

  const unlockedIds = new Set(stats.achievements);

  // Check which achievements should be unlocked
  const achievementStatus = ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: unlockedIds.has(achievement.id) || achievement.requirement(stats),
  }));

  const unlockedCount = achievementStatus.filter((a) => a.unlocked).length;
  const totalCount = achievementStatus.length;

  const filteredAchievements = selectedCategory
    ? achievementStatus.filter((a) => a.category === selectedCategory)
    : achievementStatus;

  const categories = ['learning', 'streak', 'mastery', 'special'] as const;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Achievements</h1>
              <p className="text-sm text-muted-foreground">
                {unlockedCount} / {totalCount} unlocked
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Progress overview */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <Trophy className="w-16 h-16 text-amber-500" />
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {unlockedCount}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round((unlockedCount / totalCount) * 100)}%</p>
                <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        {/* Achievements grid */}
        <div className="grid grid-cols-1 gap-3">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={cn(
                'transition-all',
                !achievement.unlocked && 'opacity-60'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-xl',
                      achievement.unlocked
                        ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      {achievement.unlocked && (
                        <span className="text-amber-500 text-sm">Unlocked!</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <span className={cn('text-xs', CATEGORY_COLORS[achievement.category])}>
                      {CATEGORY_LABELS[achievement.category]}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b p-4">
        <div className="h-8 w-48 bg-muted rounded" />
      </header>
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded-full" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </main>
    </div>
  );
}
