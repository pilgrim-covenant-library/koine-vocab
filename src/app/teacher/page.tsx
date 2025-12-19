'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  ChevronRight,
  Clock,
  Trophy,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getAllHomeworkSubmissions } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { HomeworkSubmission } from '@/types/homework';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.push('/');
      return;
    }

    if (user?.role === 'teacher') {
      loadSubmissions();
    }
  }, [user, authLoading, router]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllHomeworkSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { letter: 'A', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' };
    if (percentage >= 80) return { letter: 'B', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' };
    if (percentage >= 70) return { letter: 'C', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' };
    if (percentage >= 60) return { letter: 'D', color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' };
    return { letter: 'F', color: 'text-red-500 bg-red-100 dark:bg-red-900/30' };
  };

  if (authLoading || isLoading) {
    return <TeacherSkeleton />;
  }

  if (!user || user.role !== 'teacher') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Teacher Dashboard</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12 max-w-md text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={loadSubmissions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </main>
      </div>
    );
  }

  // Calculate stats
  const totalSubmissions = submissions.length;
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length)
    : 0;
  const perfectScores = submissions.filter(s => s.percentage === 100).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Teacher Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={loadSubmissions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSubmissions}</p>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgScore}%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{perfectScores}</p>
                <p className="text-xs text-muted-foreground">Perfect Scores</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Submissions list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Homework Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No submissions yet</p>
                <p className="text-sm mt-1">
                  Submissions will appear here when students complete homework
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => {
                  const grade = getGrade(submission.percentage);
                  return (
                    <Link
                      key={submission.studentUid}
                      href={`/teacher/student/${submission.studentUid}`}
                      className="block"
                    >
                      <div
                        className={cn(
                          'p-4 rounded-xl border transition-all',
                          'hover:border-primary/50 hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-primary">
                                {submission.displayName?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{submission.displayName || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{submission.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={cn('px-3 py-1 rounded-full font-bold text-sm', grade.color)}>
                              {grade.letter}
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="font-semibold">{submission.score}</span>
                              <span className="text-muted-foreground">/{submission.totalPossible}</span>
                              <span className="text-muted-foreground ml-1">({submission.percentage}%)</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDate(submission.completedAt)}
                          </div>
                        </div>
                      </div>
                    </Link>
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

function TeacherSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <header className="border-b p-4">
        <div className="h-8 w-48 bg-muted rounded" />
      </header>
      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </main>
    </div>
  );
}
