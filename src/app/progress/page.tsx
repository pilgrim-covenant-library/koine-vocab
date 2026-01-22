'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  Target,
  Calendar,
  Zap,
} from 'lucide-react';
import { useUserStats, useUserProgress, useUserActions } from '@/stores/userStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StudyHeatmap } from '@/components/StudyHeatmap';
import { cn } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';
import type { VocabularyWord } from '@/types';

// =============================================================================
// PRE-COMPUTED LOOKUPS - Computed once at module load for O(1) access
// =============================================================================

const allWords = vocabularyData.words as VocabularyWord[];

// Map for O(1) word lookups by ID (instead of repeated .find() calls)
const wordById = new Map<string, VocabularyWord>();
allWords.forEach(w => wordById.set(w.id, w));

// Pre-computed tier data
const TIER_WORD_IDS: Record<number, string[]> = {};
[1, 2, 3, 4, 5].forEach(tier => {
  TIER_WORD_IDS[tier] = allWords.filter(w => w.tier === tier).map(w => w.id);
});

const TIER_TOTALS: Record<number, number> = {};
[1, 2, 3, 4, 5].forEach(tier => {
  TIER_TOTALS[tier] = allWords.filter(w => w.tier === tier).length;
});

const TIER_LABELS = ['Essential', 'High Freq', 'Medium', 'Lower Freq', 'Advanced'];

const TIER_COLORS: Record<number, string> = {
  1: 'bg-emerald-500',
  2: 'bg-blue-500',
  3: 'bg-amber-500',
  4: 'bg-orange-500',
  5: 'bg-red-500',
};

export default function ProgressPage() {
  const router = useRouter();
  // Use granular selectors to minimize re-renders
  const stats = useUserStats();
  const progress = useUserProgress();
  const { getStudyHistory } = useUserActions();

  const studyHistory = useMemo(() => getStudyHistory(), [getStudyHistory]);
  const [activeTab, setActiveTab] = useState<'overview' | 'weak' | 'mastered'>('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate statistics - optimized with pre-computed lookups
  const analytics = useMemo(() => {
    const progressEntries = Object.entries(progress);

    // Words by status
    const learned = progressEntries.filter(([, p]) => p.interval >= 21).length;
    const learning = progressEntries.filter(([, p]) => p.interval > 0 && p.interval < 21).length;
    const newWords = allWords.length - progressEntries.length;

    // Words by tier - using pre-computed tier totals
    const tierCounts = [1, 2, 3, 4, 5].map(tier => {
      const tierWordIds = TIER_WORD_IDS[tier];
      const studied = tierWordIds.filter(id => progress[id]).length;
      return { tier, total: TIER_TOTALS[tier], studied };
    });

    // Weak words - using O(1) Map lookup instead of .find()
    const weakWords = progressEntries
      .map(([wordId, p]) => {
        const word = wordById.get(wordId); // O(1) lookup
        if (!word) return null;
        const accuracy = p.timesReviewed > 0
          ? Math.round((p.timesCorrect / p.timesReviewed) * 100)
          : 0;
        return { word, progress: p, accuracy };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter(item => item.accuracy < 70 && item.progress.timesReviewed >= 2)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);

    // Mastered words - using O(1) Map lookup
    const masteredWords = progressEntries
      .map(([wordId, p]) => {
        const word = wordById.get(wordId); // O(1) lookup
        if (!word) return null;
        const accuracy = p.timesReviewed > 0
          ? Math.round((p.timesCorrect / p.timesReviewed) * 100)
          : 0;
        return { word, progress: p, accuracy };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter(item => item.accuracy >= 90 && item.progress.interval >= 21)
      .sort((a, b) => b.progress.interval - a.progress.interval)
      .slice(0, 10);

    // Average accuracy
    const totalReviews = progressEntries.reduce((sum, [, p]) => sum + p.timesReviewed, 0);
    const totalCorrect = progressEntries.reduce((sum, [, p]) => sum + p.timesCorrect, 0);
    const averageAccuracy = totalReviews > 0
      ? Math.round((totalCorrect / totalReviews) * 100)
      : 0;

    // Part of speech analysis - using O(1) Map lookup
    const partsOfSpeech = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'particle', 'pronoun', 'article'];
    const posStats = partsOfSpeech.map(pos => {
      const posWords = progressEntries
        .filter(([wordId]) => {
          const word = wordById.get(wordId); // O(1) lookup
          return word?.partOfSpeech?.toLowerCase().includes(pos);
        });
      const total = posWords.length;
      const correct = posWords.reduce((sum, [, p]) => sum + p.timesCorrect, 0);
      const reviews = posWords.reduce((sum, [, p]) => sum + p.timesReviewed, 0);
      const accuracy = reviews > 0 ? Math.round((correct / reviews) * 100) : 0;
      return { pos, total, reviews, accuracy };
    }).filter(p => p.reviews >= 5).sort((a, b) => a.accuracy - b.accuracy);

    // Tier accuracy analysis - using pre-computed tier word IDs
    const tierWordIdSets = [1, 2, 3, 4, 5].reduce((acc, tier) => {
      acc[tier] = new Set(TIER_WORD_IDS[tier]);
      return acc;
    }, {} as Record<number, Set<string>>);

    const tierStats = tierCounts.map(({ tier, total, studied }) => {
      const tierWordIdSet = tierWordIdSets[tier];
      const tierProgress = progressEntries.filter(([wordId]) => tierWordIdSet.has(wordId));
      const correct = tierProgress.reduce((sum, [, p]) => sum + p.timesCorrect, 0);
      const reviews = tierProgress.reduce((sum, [, p]) => sum + p.timesReviewed, 0);
      const accuracy = reviews > 0 ? Math.round((correct / reviews) * 100) : 0;
      return { tier, total, studied, reviews, accuracy };
    }).filter(t => t.reviews >= 5);

    // Identify weakest areas
    const weakestPos = posStats.length > 0 && posStats[0].accuracy < 70 ? posStats[0] : null;
    const weakestTier = [...tierStats].sort((a, b) => a.accuracy - b.accuracy)[0]?.accuracy < 70
      ? [...tierStats].sort((a, b) => a.accuracy - b.accuracy)[0]
      : null;

    return {
      learned,
      learning,
      newWords,
      tierCounts,
      weakWords,
      masteredWords,
      averageAccuracy,
      totalReviews,
      totalWords: allWords.length,
      posStats,
      tierStats,
      weakestPos,
      weakestTier,
    };
  }, [progress]);

  if (!mounted) {
    return <ProgressSkeleton />;
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Learning Analytics</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-500">{stats.streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-500">{analytics.averageAccuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{analytics.totalReviews}</div>
              <div className="text-xs text-muted-foreground">Total Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Study Activity Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Study Activity (Last 12 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StudyHeatmap studyHistory={studyHistory} />
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm mb-2">
              <span>
                {analytics.learned + analytics.learning} / {analytics.totalWords} words studied
              </span>
              <span className="text-muted-foreground">
                {Math.round(((analytics.learned + analytics.learning) / analytics.totalWords) * 100)}%
              </span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${(analytics.learned / analytics.totalWords) * 100}%` }}
                title={`${analytics.learned} mastered`}
              />
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${(analytics.learning / analytics.totalWords) * 100}%` }}
                title={`${analytics.learning} learning`}
              />
            </div>
            <div className="flex justify-center gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span>Mastered ({analytics.learned})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span>Learning ({analytics.learning})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-muted" />
                <span>New ({analytics.newWords})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress by Tier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress by Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.tierCounts.map(({ tier, total, studied }) => (
              <div key={tier}>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tier {tier}: {TIER_LABELS[tier - 1]}</span>
                  <span className="text-muted-foreground">{studied} / {total}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full transition-all', TIER_COLORS[tier])}
                    style={{ width: `${(studied / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weakness Analysis */}
        {(analytics.weakestPos || analytics.weakestTier || analytics.weakWords.length > 0) && (
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Target className="w-5 h-5" />
                Areas to Focus On
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weakest Part of Speech */}
              {analytics.weakestPos && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div>
                    <p className="font-medium capitalize">{analytics.weakestPos.pos}s</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.weakestPos.total} words studied
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">{analytics.weakestPos.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">accuracy</p>
                  </div>
                </div>
              )}

              {/* Weakest Tier */}
              {analytics.weakestTier && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div>
                    <p className="font-medium">Tier {analytics.weakestTier.tier}: {TIER_LABELS[analytics.weakestTier.tier - 1]}</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.weakestTier.studied} of {analytics.weakestTier.total} words studied
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">{analytics.weakestTier.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">accuracy</p>
                  </div>
                </div>
              )}

              {/* Part of Speech breakdown (if data available) */}
              {analytics.posStats.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Accuracy by Part of Speech</p>
                  <div className="grid grid-cols-2 gap-2">
                    {analytics.posStats.slice(0, 6).map(({ pos, accuracy, reviews }) => (
                      <div key={pos} className="flex items-center justify-between text-xs p-2 rounded bg-background border">
                        <span className="capitalize">{pos}</span>
                        <span className={cn(
                          'font-medium',
                          accuracy < 60 ? 'text-red-500' :
                          accuracy < 80 ? 'text-orange-500' :
                          'text-emerald-500'
                        )}>
                          {accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Button */}
              <Link href="/learn/cram">
                <Button variant="outline" className="w-full mt-2 border-orange-300 dark:border-orange-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Practice Weak Areas
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Weak/Mastered Words */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('weak')}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors',
              activeTab === 'weak'
                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <AlertTriangle className="w-4 h-4 inline mr-1.5" />
            Needs Practice ({analytics.weakWords.length})
          </button>
          <button
            onClick={() => setActiveTab('mastered')}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors',
              activeTab === 'mastered'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Award className="w-4 h-4 inline mr-1.5" />
            Mastered ({analytics.masteredWords.length})
          </button>
        </div>

        {/* Word Lists */}
        <Card>
          <CardContent className="p-4">
            {activeTab === 'weak' && (
              <div className="space-y-3">
                {analytics.weakWords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No words needing extra practice yet. Keep studying!
                  </p>
                ) : (
                  analytics.weakWords.map(({ word, accuracy }) => (
                    <div key={word.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{word.greek}</p>
                        <p className="text-sm text-muted-foreground">{word.gloss}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          'font-bold',
                          accuracy < 50 ? 'text-red-500' : 'text-orange-500'
                        )}>
                          {accuracy}%
                        </p>
                        <p className="text-xs text-muted-foreground">accuracy</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'mastered' && (
              <div className="space-y-3">
                {analytics.masteredWords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No fully mastered words yet. Keep practicing to master vocabulary!
                  </p>
                ) : (
                  analytics.masteredWords.map(({ word, accuracy, progress: p }) => (
                    <div key={word.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{word.greek}</p>
                        <p className="text-sm text-muted-foreground">{word.gloss}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500">{accuracy}%</p>
                        <p className="text-xs text-muted-foreground">{p.interval}d interval</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/learn">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-1">
              <Zap className="w-5 h-5" />
              <span>Start Learning</span>
            </Button>
          </Link>
          <Link href="/vocabulary">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-1">
              <BookOpen className="w-5 h-5" />
              <span>Browse Words</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Header skeleton */}
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded" />
          <div className="w-40 h-6 bg-muted rounded" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-muted rounded-xl">
              <div className="w-8 h-8 bg-background/50 rounded mb-2" />
              <div className="w-12 h-8 bg-background/50 rounded mb-1" />
              <div className="w-20 h-4 bg-background/50 rounded" />
            </div>
          ))}
        </div>

        {/* Heatmap skeleton */}
        <div className="p-6 bg-muted rounded-xl">
          <div className="w-48 h-6 bg-background/50 rounded mb-4" />
          <div className="h-32 bg-background/50 rounded" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-24 h-10 bg-muted rounded-lg" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-muted rounded-xl h-20" />
          ))}
        </div>
      </main>
    </div>
  );
}
