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
  AlertCircle,
  RefreshCw,
  ClipboardList,
  CheckCircle,
  Circle,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getUserData, getProgressFromCloud, getStudentHomework, type AppUser, type SyncedProgress } from '@/lib/firebase';
import { getAchievement } from '@/lib/achievements';
import { SECTION_META, type Homework1Progress, type SectionId } from '@/types/homework';
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
  const [homework, setHomework] = useState<{ hw1?: Homework1Progress }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      const [studentData, progressData, homeworkData] = await Promise.all([
        getUserData(studentId),
        getProgressFromCloud(studentId),
        getStudentHomework(studentId),
      ]);

      // Verify student is linked to this teacher
      if (!studentData) {
        setError('Student not found. They may have deleted their account.');
        return;
      }

      if (studentData.teacherId !== user?.uid) {
        setError('This student is not linked to your account.');
        return;
      }

      setStudent(studentData);
      setProgress(progressData);
      setHomework(homeworkData);
    } catch (err) {
      setError('Failed to load student data. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <StudentDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/teacher')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Student Progress</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12 max-w-md text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/teacher')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={loadStudentData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
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
      const wordProg = progress?.words[wordId];
      return word?.tier === tier && (wordProg?.maxRepetitions || wordProg?.repetitions || 0) >= 5;
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

  // Get homework grade
  const getHomeworkGrade = (score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    if (percentage >= 90) return { letter: 'A', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (percentage >= 80) return { letter: 'B', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (percentage >= 70) return { letter: 'C', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    if (percentage >= 60) return { letter: 'D', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' };
    return { letter: 'F', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
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

        {/* Homework Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Homework Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {homework.hw1 ? (
              <div className="space-y-4">
                {/* Homework 1 Summary */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Homework 1: Greek Alphabet</h4>
                    <p className="text-sm text-muted-foreground">
                      {homework.hw1.status === 'completed'
                        ? `Completed ${formatDate(homework.hw1.completedAt ? new Date(homework.hw1.completedAt).toISOString() : null)}`
                        : homework.hw1.status === 'in_progress'
                        ? 'In Progress'
                        : 'Not Started'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {homework.hw1.status === 'completed' ? (
                      <>
                        <div className={cn(
                          'px-3 py-1 rounded-full font-bold text-lg',
                          getHomeworkGrade(homework.hw1.totalScore, homework.hw1.totalPossible).bg,
                          getHomeworkGrade(homework.hw1.totalScore, homework.hw1.totalPossible).color
                        )}>
                          {getHomeworkGrade(homework.hw1.totalScore, homework.hw1.totalPossible).letter}
                        </div>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </>
                    ) : homework.hw1.status === 'in_progress' ? (
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Score display for completed homework */}
                {homework.hw1.status === 'completed' && (
                  <div className="flex items-center justify-center gap-4 py-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{homework.hw1.totalScore}</p>
                      <p className="text-xs text-muted-foreground">Correct</p>
                    </div>
                    <div className="text-2xl text-muted-foreground">/</div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{homework.hw1.totalPossible}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="text-2xl text-muted-foreground">=</div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {Math.round((homework.hw1.totalScore / homework.hw1.totalPossible) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                )}

                {/* Section breakdown */}
                {(homework.hw1.status === 'completed' || homework.hw1.status === 'in_progress') && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Section Breakdown</p>
                    {([1, 2, 3, 4, 5] as SectionId[]).map((sectionId) => {
                      const section = homework.hw1!.sections[sectionId];
                      const meta = SECTION_META[sectionId];
                      const sectionPercentage = section.totalQuestions > 0
                        ? Math.round((section.score / section.totalQuestions) * 100)
                        : 0;

                      return (
                        <div key={sectionId} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {section.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : section.status === 'in_progress' ? (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span>{meta.title}</span>
                            </div>
                            <span className="text-muted-foreground">
                              {section.status === 'completed'
                                ? `${section.score}/${section.totalQuestions} (${sectionPercentage}%)`
                                : section.status === 'in_progress'
                                ? `${section.answers.length}/${section.totalQuestions} answered`
                                : 'Not started'}
                            </span>
                          </div>
                          {section.status !== 'not_started' && (
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full transition-all',
                                  section.status === 'completed'
                                    ? sectionPercentage >= 80
                                      ? 'bg-green-500'
                                      : sectionPercentage >= 60
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                    : 'bg-blue-500'
                                )}
                                style={{
                                  width: section.status === 'completed'
                                    ? `${sectionPercentage}%`
                                    : `${(section.answers.length / section.totalQuestions) * 100}%`
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No homework assigned yet
              </p>
            )}
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
                {stats.achievements.map((achievementId) => {
                  const achievement = getAchievement(achievementId);
                  return (
                    <span
                      key={achievementId}
                      className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-full text-sm flex items-center gap-1"
                      title={achievement?.description}
                    >
                      <span>{achievement?.icon || '🏆'}</span>
                      <span>{achievement?.name || achievementId}</span>
                    </span>
                  );
                })}
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
