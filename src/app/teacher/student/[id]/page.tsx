'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  Target,
  BookOpen,
  Calendar,
  Award,
  Flame,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getUserData, getProgressFromCloud, type AppUser, type SyncedProgress } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ProgressRing';
import { cn } from '@/lib/utils';
import vocabularyData from '@/data/vocabulary.json';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const { user, isLoading: authLoading } = useAuthStore();
  const [student, setStudent] = useState<AppUser | null>(null);
  const [progress, setProgress] = useState<SyncedProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.push('/');
      return;
    }

    if (user?.role === 'teacher' && studentId) {
      loadStudentData();
    }
  }, [user, authLoading, studentId, router]);

  const loadStudentData = async () => {
    setIsLoading(true);
    try {
      const [studentData, progressData] = await Promise.all([
        getUserData(studentId),
        getProgressFromCloud(studentId),
      ]);

      // Verify student is linked to this teacher
      if (studentData?.teacherId !== user?.uid) {
        router.push('/teacher');
        return;
      }

      setStudent(studentData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading student data:', error);
      router.push('/teacher');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <StudentDetailSkeleton />;
  }

  if (!student || !user || user.role !== 'teacher') {
    return null;
  }

  const stats = progress?.stats || {
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    achievements: [],
    wordsLearned: 0,
    wordsInProgress: 0,
    totalReviews: 0,
    correctReviews: 0,
  };

  const accuracy = stats.totalReviews > 0
    ? Math.round((stats.correctReviews / stats.totalReviews) * 100)
    : 0;

  const totalWords = vocabularyData.words.length;
  const progressPercentage = Math.round((stats.wordsLearned / totalWords) * 100);

  // Calculate tier progress
  const tierProgress = [1, 2, 3, 4, 5].map((tier) => {
    const tierWords = vocabularyData.words.filter((w) => w.tier === tier);
    const learnedInTier = Object.keys(progress?.words || {}).filter((wordId) => {
      const word = vocabularyData.words.find((w) => w.id === wordId);
      return word?.tier === tier && (progress?.words[wordId]?.repetitions || 0) >= 5;
    }).length;
    return {
      tier,
      total: tierWords.length,
      learned: learnedInTier,
      percentage: Math.round((learnedInTier / tierWords.length) * 100),
    };
  });

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/teacher')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Student Progress</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Student header */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {student.displayName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{student.displayName || 'Unknown'}</h2>
                <p className="text-muted-foreground">{student.email}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(student.createdAt.toISOString())}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <ProgressRing progress={progressPercentage} size={120} strokeWidth={10}>
                <div className="text-center">
                  <p className="text-2xl font-bold">{progressPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </ProgressRing>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">{stats.wordsLearned}</span>
                  <span className="text-sm text-muted-foreground">words learned</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{stats.wordsInProgress}</span>
                  <span className="text-sm text-muted-foreground">in progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">{stats.totalReviews}</span>
                  <span className="text-sm text-muted-foreground">total reviews</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">Lv. {stats.level}</p>
                <p className="text-xs text-muted-foreground">{stats.xp.toLocaleString()} XP</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold">{formatDate(stats.lastStudyDate)}</p>
                <p className="text-xs text-muted-foreground">Last Active</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tier progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vocabulary Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tierProgress.map(({ tier, total, learned, percentage }) => (
              <div key={tier}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">
                    Tier {tier}: {['Essential', 'High Freq', 'Medium', 'Lower', 'Advanced'][tier - 1]}
                  </span>
                  <span className="text-muted-foreground">
                    {learned}/{total}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      tier === 1 && 'bg-emerald-500',
                      tier === 2 && 'bg-blue-500',
                      tier === 3 && 'bg-amber-500',
                      tier === 4 && 'bg-orange-500',
                      tier === 5 && 'bg-red-500'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Achievements ({stats.achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No achievements yet
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.achievements.map((achievementId) => (
                  <span
                    key={achievementId}
                    className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full text-sm"
                  >
                    {achievementId}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StudentDetailSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b p-4">
        <div className="h-8 w-48 bg-muted rounded" />
      </header>
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div className="h-28 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-muted rounded-xl" />
      </main>
    </div>
  );
}
